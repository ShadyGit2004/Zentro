import crypto from "crypto";

import User from "../../models/user.model";
import { sendSubscriptionInvoiceEmail } from "../email.service";
import Payment, { type IPayment } from "../../models/payment.model";
import Subscription from "../../models/subscription.model";
import { SUBSCRIPTION_PLANS, SubscriptionPlan } from "../../config/subscription";
import { paymentConfig } from "../../config/payment";
import paymentProvider from "./payment.provider";
import type {
  RazorpayWebhookEvent,
  RazorpayWebhookPayload,
  VerifyPaymentInput,
} from "./payment.types";
import AppError from "../../utils/appError";
import Post from "../../models/post.model";

type PaidPlan = "bronze" | "silver" | "gold";

const getPostUsage = async (userId: string) => {
  const now = new Date();

  let plan: SubscriptionPlan = "free";
  let periodStart: Date;
  let periodEnd: Date;
  let subscriptionStatus: "active" | "expired" = "active";
  let subscription = null;

  subscription = await Subscription.findOne({
    user: userId,
    status: "active",
  })
    .sort({ createdAt: -1 })
    .lean();

  if (subscription && subscription.endDate && subscription.endDate > now) {
    plan = subscription.plan;

    periodStart = subscription.startDate ?? now;
    periodEnd = subscription.endDate;
  } else {
    if (subscription && subscription.endDate && subscription.endDate <= now) {
      await Subscription.updateOne(
        { _id: subscription._id },
        { $set: { status: "expired" } }
      );

      subscriptionStatus = "expired";
    }

    periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

    periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }

  const planConfig = SUBSCRIPTION_PLANS[plan];

  const postsUsed = await Post.countDocuments({
    author: userId,
    createdAt: {
      $gte: periodStart,
      $lt: periodEnd,
    },
  });

  return {
    plan,
    subscription,
    subscriptionStatus,
    postLimit: planConfig.postLimit,
    postsUsed,
    postsRemaining:
      planConfig.postLimit === null
        ? null
        : Math.max(planConfig.postLimit - postsUsed, 0),
    periodStart,
    periodEnd,
  };
};

const checkPostLimit = async (userId: string) => {
  const usage = await getPostUsage(userId);

  // Gold / unlimited
  if (usage.postLimit === null) {
    return usage;
  }

  if (usage.postsUsed >= usage.postLimit) {
    throw new AppError(
      403,
      "POST_LIMIT_REACHED",
      `You have reached your ${
        SUBSCRIPTION_PLANS[usage.plan].name
      } plan post limit of ${usage.postLimit} posts for this period`
    );
  }

  return usage;
};

const getCurrentSubscription = async (userId: string) => {
  const usage = await getPostUsage(userId);
  const planConfig = SUBSCRIPTION_PLANS[usage.plan];

  return {
    plan: usage.plan,
    planName: planConfig.name,
    status: usage.subscriptionStatus,
    price: planConfig.price,
    currency: planConfig.currency,
    billingInterval: planConfig.billingInterval,
    postLimit: usage.postLimit,
    postsUsed: usage.postsUsed,
    postsRemaining: usage.postsRemaining,
    periodStart: usage.periodStart,
    periodEnd: usage.periodEnd,
  };
};

const createPaymentOrder = async (userId: string, plan: PaidPlan) => {
  const planConfig = SUBSCRIPTION_PLANS[plan];

  if (!planConfig) {
    throw new AppError(
      400,
      "INVALID_SUBSCRIPTION_PLAN",
      "Invalid subscription plan"
    );
  }

  if (planConfig.price <= 0) {
    throw new AppError(
      400,
      "INVALID_PAYMENT_PLAN",
      "This plan does not require payment"
    );
  }

  const existingSubscription = await Subscription.findOne({
    user: userId,
    status: "active",
  }).lean();

  if (existingSubscription) {
    throw new AppError(
      409,
      "ACTIVE_SUBSCRIPTION_EXISTS",
      "You already have an active subscription"
    );
  }

  const amount = planConfig.price * 100;

  const receipt = `sub_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

  const order = await paymentProvider.createOrder({
    userId,
    plan,
    amount,
    currency: planConfig.currency,
    receipt,
  });

  const subscription = await Subscription.create({
    user: userId,
    plan,
    status: "pending",
    provider: paymentConfig.provider,
  });

  await Payment.create({
    user: userId,
    subscription: subscription._id,
    plan,
    provider: paymentConfig.provider,
    providerOrderId: order.providerOrderId,
    amount: order.amount,
    currency: order.currency,
    status: "created",
  });

  return {
    orderId: order.providerOrderId,
    amount: order.amount,
    currency: order.currency,
    plan,
    keyId: process.env.RAZORPAY_KEY_ID,
  };
};

const activatePaidPayment = async (
  payment: IPayment | null,
  providerPaymentId: string
) => {
  if (!payment) {
    throw new AppError(404, "PAYMENT_NOT_FOUND", "Payment not found");
  }

  if (!payment.subscription) {
    throw new AppError(
      500,
      "PAYMENT_SUBSCRIPTION_MISSING",
      "Payment subscription reference is missing"
    );
  }

  const session = await Payment.startSession();

  try {
    let result: {
      verified: boolean;
      providerOrderId: string;
      providerPaymentId?: string;
      subscriptionId: unknown;
      shouldSendInvoice: boolean;
      paymentId: unknown;
    };

    await session.withTransaction(async () => {
      const currentPayment = await Payment.findOneAndUpdate(
        {
          _id: payment._id,
          status: "created",
        },
        {
          $set: {
            providerPaymentId,
            status: "paid",
            paidAt: new Date(),
          },
        },
        {
          new: true,
          session,
        }
      );

      // Another request (verify/webhook) already processed this payment.
      if (!currentPayment) {
        const existingPayment = await Payment.findById(payment._id).session(
          session
        );

        if (!existingPayment) {
          throw new AppError(404, "PAYMENT_NOT_FOUND", "Payment not found");
        }

        if (existingPayment.status === "paid") {
          result = {
            verified: true,
            providerOrderId: existingPayment.providerOrderId,
            providerPaymentId: existingPayment.providerPaymentId,
            subscriptionId: existingPayment.subscription,
            shouldSendInvoice: !existingPayment.invoiceEmailSentAt,
            paymentId: existingPayment._id,
          };

          return;
        }

        throw new AppError(
          400,
          "INVALID_PAYMENT_STATUS",
          "Payment cannot be processed in its current state"
        );
      }

      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);

      const subscription = await Subscription.findOneAndUpdate(
        {
          _id: currentPayment.subscription,
          user: currentPayment.user,
          status: "pending",
        },
        {
          $set: {
            plan: currentPayment.plan,
            status: "active",
            startDate,
            endDate,
            provider: currentPayment.provider,
          },
          $unset: {
            providerCustomerId: 1,
            providerSubscriptionId: 1,
          },
        },
        {
          new: true,
          session,
        }
      );

      if (!subscription) {
        throw new AppError(
          404,
          "SUBSCRIPTION_NOT_FOUND",
          "Subscription not found"
        );
      }

      result = {
        verified: true,
        providerOrderId: currentPayment.providerOrderId,
        providerPaymentId: currentPayment.providerPaymentId,
        subscriptionId: subscription._id,
        shouldSendInvoice: !currentPayment.invoiceEmailSentAt,
        paymentId: currentPayment._id,
      };
    });

    // Transaction committed successfully.
    // Email is intentionally outside the transaction.

    if (result!.shouldSendInvoice) {
      const currentPayment = await Payment.findById(result!.paymentId).lean();

      if (currentPayment && !currentPayment.invoiceEmailSentAt) {
        const user = await User.findById(currentPayment.user)
          .select("email displayName username")
          .lean();

        const subscription = await Subscription.findById(
          currentPayment.subscription
        ).lean();

        if (user && subscription) {
          try {
            await sendSubscriptionInvoiceEmail({
              email: user.email,
              displayName: user.displayName || user.username,
              plan: subscription.plan,
              amount: currentPayment.amount,
              currency: currentPayment.currency,
              paymentDate: currentPayment.paidAt!,
              providerPaymentId: currentPayment.providerPaymentId!,
              providerOrderId: currentPayment.providerOrderId,
              periodStart: subscription.startDate!,
              periodEnd: subscription.endDate!,
            });

            await Payment.updateOne(
              {
                _id: currentPayment._id,
                invoiceEmailSentAt: {
                  $exists: false,
                },
              },
              {
                $set: {
                  invoiceEmailSentAt: new Date(),
                },
              }
            );
          } catch (error) {
            console.error("Subscription invoice email failed:", error);
          }
        }
      }
    }

    return {
      verified: result!.verified,
      providerOrderId: result!.providerOrderId,
      providerPaymentId: result!.providerPaymentId,
      subscriptionId: result!.subscriptionId,
    };
  } finally {
    await session.endSession();
  }
};

const verifyPayment = async (userId: string, input: VerifyPaymentInput) => {
  const isValid = paymentProvider.verifyPayment(input);

  if (!isValid) {
    throw new AppError(
      400,
      "INVALID_PAYMENT_SIGNATURE",
      "Payment verification failed"
    );
  }

  const payment = await Payment.findOne({
    user: userId,
    providerOrderId: input.providerOrderId,
  });

  return activatePaidPayment(payment, input.providerPaymentId);
};

const handleRazorpayWebhookEvent = async (
  event: RazorpayWebhookEvent,
  payload: RazorpayWebhookPayload
) => {
  switch (event) {
    case "payment.captured": {
      const paymentEntity = payload?.payment?.entity;

      const providerOrderId = paymentEntity?.order_id;
      const providerPaymentId = paymentEntity?.id;

      if (!providerOrderId || !providerPaymentId) {
        return {
          handled: false,
          message: "Payment order ID or payment ID is missing",
        };
      }

      const payment = await Payment.findOne({
        providerOrderId,
      });

      if (!payment) {
        return {
          handled: false,
          message: "Payment not found",
        };
      }

      const result = await activatePaidPayment(payment, providerPaymentId);

      return {
        handled: true,
        ...result,
      };
    }

    case "payment.failed": {
      const paymentEntity = payload?.payment?.entity;

      const providerOrderId = paymentEntity?.order_id;

      if (!providerOrderId) {
        return {
          handled: false,
          message: "Payment order ID is missing",
        };
      }

      const payment = await Payment.findOne({
        providerOrderId,
      });

      if (!payment) {
        return {
          handled: false,
          message: "Payment not found",
        };
      }

      if (payment.status === "created") {
        payment.status = "failed";
        payment.failedAt = new Date();

        await payment.save();
      }

      return {
        handled: true,
        providerOrderId: payment.providerOrderId,
        status: payment.status,
      };
    }

    default:
      return {
        handled: false,
        message: `Webhook event "${event}" is not handled`,
      };
  }
};

const getPaymentHistory = async (
  userId: string,
  limit: number = 10,
  cursor?: string
) => {
  const query: {
    user: string;
    _id?: {
      $lt: string;
    };
  } = {
    user: userId,
  };

  if (cursor) {
    query._id = {
      $lt: cursor,
    };
  }

  const payments = await Payment.find(query)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .select(
      "_id plan amount currency status provider providerOrderId providerPaymentId paidAt failedAt refundedAt createdAt"
    )
    .lean();

  const hasNextPage = payments.length > limit;

  const items = hasNextPage ? payments.slice(0, limit) : payments;

  const nextCursor = hasNextPage ? String(items[items.length - 1]._id) : null;

  return {
    data : items,
    pagination: {
      nextCursor,
      hasNextPage,
    },
  };
};

export {
  createPaymentOrder,
  verifyPayment,
  handleRazorpayWebhookEvent,
  getPostUsage,
  checkPostLimit,
  getCurrentSubscription,
  getPaymentHistory,
};

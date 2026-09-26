import crypto from "crypto";

import Payment, { type IPayment } from "../../models/payment.model";
import Subscription from "../../models/subscription.model";
import { SUBSCRIPTION_PLANS } from "../../config/subscription";
import { paymentConfig } from "../../config/payment";
import paymentProvider from "./payment.provider";
import type {
  RazorpayWebhookEvent,
  RazorpayWebhookPayload,
  VerifyPaymentInput,
} from "./payment.types";
import AppError from "../../utils/appError";

type PaidPlan = "bronze" | "silver" | "gold";

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

  // Webhook + frontend callback dono aa sakte hain.
  // Already paid payment ko dobara process nahi karna.
  if (payment.status === "paid") {
    return {
      verified: true,
      providerOrderId: payment.providerOrderId,
      providerPaymentId: payment.providerPaymentId,
      subscriptionId: payment.subscription,
    };
  }

  if (payment.status !== "created") {
    throw new AppError(
      400,
      "INVALID_PAYMENT_STATUS",
      "Payment cannot be processed in its current state"
    );
  }

  if (!payment.subscription) {
    throw new AppError(
      500,
      "PAYMENT_SUBSCRIPTION_MISSING",
      "Payment subscription reference is missing"
    );
  }

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);

  const subscription = await Subscription.findOneAndUpdate(
    {
      _id: payment.subscription,
      user: payment.user,
    },
    {
      $set: {
        plan: payment.plan,
        status: "active",
        startDate,
        endDate,
        provider: payment.provider,
      },
      $unset: {
        providerCustomerId: 1,
        providerSubscriptionId: 1,
      },
    },
    {
      new: true,
    }
  );

  if (!subscription) {
    throw new AppError(404, "SUBSCRIPTION_NOT_FOUND", "Subscription not found");
  }

  payment.providerPaymentId = providerPaymentId;
  payment.status = "paid";
  payment.paidAt = new Date();

  await payment.save();

  return {
    verified: true,
    providerOrderId: payment.providerOrderId,
    providerPaymentId: payment.providerPaymentId,
    subscriptionId: subscription._id,
  };
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

export { createPaymentOrder, verifyPayment, handleRazorpayWebhookEvent };

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreatePaymentOrder,
  useCurrentSubscription,
  usePaymentHistory,
  useVerifyPayment,
} from "../hooks";
import SubscriptionSkeleton from "./SubscriptionSkeleton";
import type { PaymentStatus, SubscriptionPlan } from "../types";
import { useRazorpay } from "react-razorpay";
import { getApiErrorMessage } from "@/lib/api-error";
import { CurrencyCode } from "react-razorpay/dist/constants/currency";

const PLANS: {
  plan: SubscriptionPlan;
  name: string;
  price: number;
  postLimit: string;
}[] = [
  {
    plan: "free",
    name: "Free",
    price: 0,
    postLimit: "3 posts / month",
  },
  {
    plan: "bronze",
    name: "Bronze",
    price: 100,
    postLimit: "5 posts / month",
  },
  {
    plan: "silver",
    name: "Silver",
    price: 300,
    postLimit: "15 posts / month",
  },
  {
    plan: "gold",
    name: "Gold",
    price: 1000,
    postLimit: "Unlimited posts",
  },
];

const formatDate = (date?: string) => {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatAmount = (amount: number, currency: string) => {
  const value = amount / 100;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
};

const getStatusClasses = (status: PaymentStatus) => {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";

    case "failed":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";

    case "refunded":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";

    default:
      return "bg-muted text-muted-foreground";
  }
};

const SubscriptionPlans = () => {
  const { Razorpay } = useRazorpay();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useCurrentSubscription();

  const {
    data: paymentHistory,
    isLoading: isPaymentHistoryLoading,
    isError: isPaymentHistoryError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = usePaymentHistory();

  const createOrderMutation = useCreatePaymentOrder();
  const verifyPaymentMutation = useVerifyPayment();

  const [processingPlan, setProcessingPlan] = useState<Exclude<
    SubscriptionPlan,
    "free"
  > | null>(null);

  /*
   * useInfiniteQuery returns pages.
   * Flatten all loaded pages into one array for the UI.
   */
  const paymentHistoryItems = paymentHistory?.pages.flatMap((page) => page.data.data) ?? [];

  const handleSubscribe = async (plan: Exclude<SubscriptionPlan, "free">) => {
    try {
      setProcessingPlan(plan);

      const orderResponse = await createOrderMutation.mutateAsync({
        plan,
      });

      const order = orderResponse.data;

      if (!order.keyId) {
        throw new Error("Razorpay key is missing.");
      }

      if (!Razorpay) {
        throw new Error("Razorpay Checkout is not loaded.");
      }

      const razorpay = new Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency as CurrencyCode,
        name: "Zentro",
        description: `${order.plan} subscription`,
        order_id: order.orderId,

        handler: async (response) => {
          try {
            const verification = await verifyPaymentMutation.mutateAsync({
              providerOrderId: response.razorpay_order_id,
              providerPaymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });

            if (verification.data.verified) {
              toast.success("Payment verified successfully.");

              await queryClient.invalidateQueries({
                queryKey: ["current-subscription"],
              });

              await queryClient.invalidateQueries({
                queryKey: ["payment-history"],
              });
            } else {
              toast.error("Payment verification failed.");
            }
          } catch (error) {
            toast.error(
              getApiErrorMessage(error, "Payment verification failed.")
            );
          } finally {
            setProcessingPlan(null);
          }
        },

        modal: {
          ondismiss: () => {
            setProcessingPlan(null);
          },
        },
      });

      razorpay.open();
    } catch (error) {
      setProcessingPlan(null);

      toast.error(getApiErrorMessage(error, "Unable to start payment."));
    }
  };  

  if (isLoading) {
    return <SubscriptionSkeleton />;    
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border p-5">
        <p className="text-sm text-destructive">
          {getApiErrorMessage(error, "Unable to load subscription.")}
        </p>
      </div>
    );
  }

  const usageText =
    data.postsRemaining === null
      ? "Unlimited posts"
      : `${data.postsUsed} / ${data.postLimit} posts used`;

  const remainingText =
    data.postsRemaining === null
      ? "Unlimited"
      : `${data.postsRemaining} posts remaining`;

  const progress =
    data.postLimit === null
      ? 100
      : Math.min((data.postsUsed / data.postLimit) * 100, 100);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Subscription</h1>

      <p className="mt-1 text-sm text-muted-foreground">
        Manage your subscription, usage, plans, and payment history.
      </p>

      {/* Current Subscription */}
      <div className="rounded-2xl border p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Current subscription
            </p>

            <div className="mt-1 flex items-center gap-3">
              <h2 className="text-2xl font-bold">{data.planName}</h2>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  data.status === "active"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {data.status === "active" ? "Active" : "Expired"}
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-xl font-semibold">
              ₹{data.price}
              {data.price > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  /month
                </span>
              )}
            </p>

            <p className="text-xs capitalize text-muted-foreground">
              {data.billingInterval}
            </p>
          </div>
        </div>

        {/* Usage */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Post usage</span>

            <span className="text-muted-foreground">{usageText}</span>
          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>{remainingText}</span>

            <span>
              Limit: {data.postLimit === null ? "Unlimited" : data.postLimit}
            </span>
          </div>
        </div>

        {/* Subscription Dates */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Start date</p>

            <p className="mt-1 text-sm font-medium">
              {formatDate(data.periodStart)}
            </p>
          </div>

          <div className="rounded-xl bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Expiry date</p>

            <p className="mt-1 text-sm font-medium">
              {formatDate(data.periodEnd)}
            </p>
          </div>
        </div>
      </div>

      {/* Subscription Plans */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Subscription plans</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Choose a plan according to your monthly post usage.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => {
            const isCurrentPlan = data.plan === plan.plan;

            const isFree = plan.plan === "free";

            const isProcessing = processingPlan === plan.plan;

            return (
              <div
                key={plan.plan}
                className={`rounded-2xl border p-5 transition ${
                  isCurrentPlan ? "border-primary ring-1 ring-primary" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{plan.name}</h3>

                  {isCurrentPlan && (
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      Current
                    </span>
                  )}
                </div>

                <p className="mt-2 text-2xl font-bold">
                  ₹{plan.price}
                  {!isFree && (
                    <span className="text-sm font-normal text-muted-foreground">
                      /month
                    </span>
                  )}
                </p>

                <p className="mt-2 text-sm text-muted-foreground">
                  {plan.postLimit}
                </p>

                {isCurrentPlan ? (
                  <button
                    type="button"
                    disabled
                    className="mt-5 w-full rounded-lg border px-4 py-2 text-sm"
                  >
                    Current plan
                  </button>
                ) : isFree ? (
                  <button
                    type="button"
                    disabled
                    className="mt-5 w-full rounded-lg border px-4 py-2 text-sm text-muted-foreground"
                  >
                    Free plan
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() =>
                      handleSubscribe(
                        plan.plan as Exclude<SubscriptionPlan, "free">
                      )
                    }
                    className="mt-5 w-full rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
                  >
                    {isProcessing ? "Processing..." : "Subscribe"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment History */}
      <div className="rounded-2xl border">
        <div className="border-b p-5">
          <h2 className="text-xl font-semibold">Payment history</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            View your previous subscription payments.
          </p>
        </div>

        {isPaymentHistoryLoading ? (
          <div className="p-5">
            <p className="text-sm text-muted-foreground">
              Loading payment history...
            </p>
          </div>
        ) : isPaymentHistoryError ? (
          <div className="p-5">
            <p className="text-sm text-destructive">
              Unable to load payment history.
            </p>
          </div>
        ) : paymentHistoryItems.length === 0 ? (
          <div className="p-8 text-center">
            <p className="font-medium">No payments yet</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Your subscription payments will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="px-5 py-3 font-medium">Plan</th>

                    <th className="px-5 py-3 font-medium">Amount</th>

                    <th className="px-5 py-3 font-medium">Status</th>

                    <th className="px-5 py-3 font-medium">Payment date</th>

                    <th className="px-5 py-3 font-medium">Payment ID</th>
                  </tr>
                </thead>

                <tbody>
                  {paymentHistoryItems.map((payment) => (
                    <tr key={payment._id} className="border-b last:border-0">
                      <td className="px-5 py-4">
                        <span className="font-medium capitalize">
                          {payment.plan}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {formatAmount(payment.amount, payment.currency)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusClasses(
                            payment.status
                          )}`}
                        >
                          {payment.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        {formatDate(payment.paidAt ?? payment.createdAt)}
                      </td>

                      <td className="max-w-[220px] px-5 py-4">
                        <p
                          className="truncate font-mono text-xs"
                          title={
                            payment.providerPaymentId ?? payment.providerOrderId
                          }
                        >
                          {payment.providerPaymentId ?? payment.providerOrderId}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="divide-y md:hidden">
              {paymentHistoryItems.map((payment) => (
                <div key={payment._id} className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold capitalize">
                        {payment.plan} plan
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatDate(payment.paidAt ?? payment.createdAt)}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusClasses(
                        payment.status
                      )}`}
                    >
                      {payment.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Amount
                    </span>

                    <span className="font-semibold">
                      {formatAmount(payment.amount, payment.currency)}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Razorpay Payment ID
                    </p>

                    <p className="mt-1 break-all font-mono text-xs">
                      {payment.providerPaymentId ?? "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">
                      Razorpay Order ID
                    </p>

                    <p className="mt-1 break-all font-mono text-xs">
                      {payment.providerOrderId}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            {hasNextPage && (
              <div className="border-t p-5 text-center">
                <button
                  type="button"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="rounded-lg border px-5 py-2 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isFetchingNextPage ? "Loading..." : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPlans;

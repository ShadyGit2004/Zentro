"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCreatePaymentOrder, useVerifyPayment } from "../hooks";
import type { SubscriptionPlan } from "../types";
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
    postLimit: "1 post",
  },
  {
    plan: "bronze",
    name: "Bronze",
    price: 100,
    postLimit: "3 posts",
  },
  {
    plan: "silver",
    name: "Silver",
    price: 300,
    postLimit: "5 posts",
  },
  {
    plan: "gold",
    name: "Gold",
    price: 1000,
    postLimit: "Unlimited posts",
  },
];

const SubscriptionPlans = () => {
  const { Razorpay } = useRazorpay();

  const createOrderMutation = useCreatePaymentOrder();
  const verifyPaymentMutation = useVerifyPayment();

  const [processingPlan, setProcessingPlan] = useState<Exclude<
    SubscriptionPlan,
    "free"
  > | null>(null);

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
            } else {
              toast.error("Payment verification failed.");
            }
          } catch(error) {
            toast.error(getApiErrorMessage(error, "Payment verification failed."));
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

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {PLANS.map((plan) => {
        const isFree = plan.plan === "free";
        const isProcessing = processingPlan === plan.plan;

        return (
          <div key={plan.plan} className="rounded-2xl border p-5">
            <h3 className="text-lg font-semibold">{plan.name}</h3>

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

            {isFree ? (
              <button
                type="button"
                disabled
                className="mt-5 w-full rounded-lg border px-4 py-2 text-sm"
              >
                Current plan
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
  );
};

export default SubscriptionPlans;

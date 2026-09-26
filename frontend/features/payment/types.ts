export type SubscriptionPlan = "free" | "bronze" | "silver" | "gold";

export interface CreatePaymentOrderInput {
  plan: Exclude<SubscriptionPlan, "free">;
}

export interface CreatePaymentOrderResponse {
  success: boolean;
  data: {
    orderId: string;
    amount: number;
    currency: string;
    plan: Exclude<SubscriptionPlan, "free">;
    keyId: string;
  };
}

export interface VerifyPaymentInput {
  providerOrderId: string;
  providerPaymentId: string;
  signature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  data: {
    verified: boolean;
    providerOrderId: string;
    providerPaymentId: string;
  };
}

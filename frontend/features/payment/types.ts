export type SubscriptionPlan = "free" | "bronze" | "silver" | "gold";

export type PaymentStatus = "created" | "paid" | "failed" | "refunded";

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

export interface CurrentSubscription {
  plan: SubscriptionPlan;
  planName: string;
  status: "active" | "expired";
  price: number;
  currency: string;
  billingInterval: "monthly";
  postLimit: number | null;
  postsUsed: number;
  postsRemaining: number | null;
  periodStart: string;
  periodEnd: string;
}

export interface PaymentHistoryItem {
  _id: string;
  plan: Exclude<SubscriptionPlan, "free">;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: "razorpay" | "stripe";
  providerOrderId: string;
  providerPaymentId?: string;
  paidAt?: string;
  failedAt?: string;
  refundedAt?: string;
  createdAt: string;
}

export interface PaymentHistoryPage {
  data: PaymentHistoryItem[];
  pagination: {
    nextCursor: string | null;
    hasNextPage : boolean;
  };
}

export interface PaymentHistoryResponse {
  success: boolean;
  data: PaymentHistoryPage;
}

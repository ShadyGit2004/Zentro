import type { SubscriptionPlan } from "../../models/subscription.model";

export interface CreatePaymentOrderInput {
  userId: string;
  plan: Exclude<SubscriptionPlan, "free">;
  amount: number;
  currency: string;
  receipt: string;
}

export interface CreatePaymentOrderResult {
  providerOrderId: string;
  amount: number;
  currency: string;
}

export interface VerifyPaymentInput {
  providerOrderId: string;
  providerPaymentId: string;
  signature: string;
}

export interface PaymentProvider {
  createOrder(
    input: CreatePaymentOrderInput
  ): Promise<CreatePaymentOrderResult>;

  verifyPayment(input: VerifyPaymentInput): boolean;
}

export interface RazorpayPaymentEntity {
  id: string;
  order_id: string;
}

export interface RazorpayWebhookPayload {
  payment?: {
    entity?: RazorpayPaymentEntity;
  };
}

export type RazorpayWebhookEvent =
  | "payment.captured"
  | "payment.failed"
  | string;
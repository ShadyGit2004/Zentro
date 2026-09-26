import crypto from "crypto";

import { razorpay } from "../../config/razorpay";
import type {
  CreatePaymentOrderInput,
  CreatePaymentOrderResult,
  PaymentProvider,
  VerifyPaymentInput,
} from "./payment.types";

class RazorpayPaymentProvider implements PaymentProvider {
  async createOrder(input: CreatePaymentOrderInput): Promise<CreatePaymentOrderResult> {
    const order = await razorpay.orders.create({
      amount: input.amount,
      currency: input.currency,
      receipt: input.receipt,
    });

    return {
      providerOrderId: order.id,
      amount: Number(order.amount),
      currency: order.currency,
    };
  }

  verifyPayment(input: VerifyPaymentInput): boolean {
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${input.providerOrderId}|${input.providerPaymentId}`)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(generatedSignature),
      Buffer.from(input.signature)
    );
  }
}

export default RazorpayPaymentProvider;

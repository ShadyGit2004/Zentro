import { paymentConfig } from "../../config/payment";
import AppError from "../../utils/appError";
import type { PaymentProvider } from "./payment.types";
import RazorpayPaymentProvider from "./razorpay.provider";

let paymentProvider: PaymentProvider;

switch (paymentConfig.provider) {
  case "razorpay":
    paymentProvider = new RazorpayPaymentProvider();
    break;

  default:
    throw new AppError(
      500,
      "UNSUPPORTED_PAYMENT_PROVIDER",
      `Unsupported payment provider: ${paymentConfig.provider}`
    );
}

export default paymentProvider;

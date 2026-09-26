import { z } from "zod";
import AppError from "../utils/appError";

const paymentConfigSchema = z.object({
  provider: z.enum(["razorpay", "stripe"]),
  currency: z
    .string()
    .trim()
    .min(3)
    .max(3)
    .transform((value) => value.toUpperCase()),
});

const parsedPaymentConfig = paymentConfigSchema.safeParse({
  provider: process.env.PAYMENT_PROVIDER,
  currency: process.env.PAYMENT_CURRENCY ?? "INR",
});

if (!parsedPaymentConfig.success) {
  throw new AppError(
    500,
    "INVALID_PAYMENT_CONFIGURATION",
    "Invalid payment configuration"
  );
}

export const paymentConfig = parsedPaymentConfig.data;

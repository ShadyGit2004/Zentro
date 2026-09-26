import { z } from "zod";

export const createPaymentOrderSchema = z.object({
  plan: z.enum(["bronze", "silver", "gold"]),
});

export const verifyPaymentSchema = z.object({
  providerOrderId: z.string().trim().min(1),
  providerPaymentId: z.string().trim().min(1),
  signature: z.string().trim().min(1),
});
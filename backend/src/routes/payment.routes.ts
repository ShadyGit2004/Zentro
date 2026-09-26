import { Router } from "express";

import authMiddleware from "../middlewares/auth.middleware";
import requireActiveUser from "../middlewares/require-active-user.middleware";
import requireVerifiedEmail from "../middlewares/require-verified-email.middleware";
import validate from "../middlewares/validate.middleware";

import {
  createPaymentOrderSchema,
  verifyPaymentSchema,
} from "../validators/payment.validator";

import {
  createPaymentOrder,
  handleRazorpayWebhook,
  verifyPayment,
} from "../controllers/payment.controller";

const router = Router();

router.post(
  "/create-order",
  authMiddleware,
  requireVerifiedEmail,
  requireActiveUser,
  validate(createPaymentOrderSchema),
  createPaymentOrder
);

router.post(
  "/verify",
  authMiddleware,
  requireVerifiedEmail,
  requireActiveUser,
  validate(verifyPaymentSchema),
  verifyPayment
);

router.post("/webhook", handleRazorpayWebhook);

export default router;

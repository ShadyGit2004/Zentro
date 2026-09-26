import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import AppError from "../utils/appError"; 

import { 
  createPaymentOrder as createPaymentOrderService,
  verifyPayment as verifyPaymentService,
  handleRazorpayWebhookEvent 
} from "../services/payment/payment.service";

interface RawBodyRequest extends Request {
  rawBody?: Buffer;
}

const createPaymentOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    }

    const { plan } = req.body;

    const order = await createPaymentOrderService(
      req.user.userId,
      plan
    );

    return res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const verifyPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    }
    
    const result = await verifyPaymentService(
      req.user.userId, {
      providerOrderId: req.body.providerOrderId,
      providerPaymentId: req.body.providerPaymentId,
      signature: req.body.signature,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const handleRazorpayWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const webhookRequest = req as RawBodyRequest;

    if (!webhookRequest.rawBody) {
      throw new AppError(
        400,
        "RAW_BODY_MISSING",
        "Webhook raw body is missing"
      );
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new AppError(
        500,
        "WEBHOOK_SECRET_MISSING",
        "Razorpay webhook secret is not configured"
      );
    }

    const signature = req.get("x-razorpay-signature");

    if (!signature) {
      throw new AppError(
        400,
        "WEBHOOK_SIGNATURE_MISSING",
        "Razorpay webhook signature is missing"
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(webhookRequest.rawBody)
      .digest("hex");

    if (
      expectedSignature.length !== signature.length ||
      !crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(signature)
      )
    ) {
      throw new AppError(
        400,
        "INVALID_WEBHOOK_SIGNATURE",
        "Invalid Razorpay webhook signature"
      );
    }

    const event = req.body?.event;

    if (!event) {
      throw new AppError(
        400,
        "WEBHOOK_EVENT_MISSING",
        "Webhook event is missing"
      );
    }

    const result = await handleRazorpayWebhookEvent(event, req.body?.payload);

    return res.status(200).json({
      success: true,
      message: result.message ?? "Webhook processed successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


export { createPaymentOrder, verifyPayment, handleRazorpayWebhook };

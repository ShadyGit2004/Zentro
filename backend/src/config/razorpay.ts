import Razorpay from "razorpay";
import AppError from "../utils/appError";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  throw new AppError(
    500,
    "RAZORPAY_CONFIG_ERROR",
    "Razorpay credentials are not configured"
  );
}

export const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

export { keyId as razorpayKeyId };

import { Router } from "express";

// Middlewares
import validate from "../middlewares/validate.middleware";
import authRateLimiter from "../middlewares/rate-limit.middleware";
import authMiddleware from "../middlewares/auth.middleware";
import requireVerifiedEmail from "../middlewares/require-verified-email.middleware";

// Zod Schemas
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  googleAuthSchema,
  updatePasswordSchema,
} from "../validators/auth.validator";

// Controllers
import {
  register,
  googleLogin,
  login,
  refresh,
  logout,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  updateUserPassword,
} from "../controllers/auth.controller";

const router = Router();

router.post(
  "/register",
  authRateLimiter,
  validate(registerSchema),
  register
);

router.post(
  "/login",
  authRateLimiter,
  validate(loginSchema),
  login
);

router.post(
  "/verify-email",
  validate(verifyEmailSchema),
  verifyEmail
);

router.post(
  "/resend-verification",
  authRateLimiter,
  validate(resendVerificationSchema),
  resendVerification
);

router.post(
  "/forgot-password",
  authRateLimiter,
  validate(forgotPasswordSchema),
  forgotPassword
);

router.post(
  "/reset-password",
  authRateLimiter,
  validate(resetPasswordSchema),
  resetPassword
);

router.patch(
  "/password",
  authRateLimiter,
  authMiddleware,
  requireVerifiedEmail,
  validate(updatePasswordSchema),
  updateUserPassword
);

router.post(
  "/google",
  authRateLimiter,
  validate(googleAuthSchema),
  googleLogin
);

router.post("/refresh", authRateLimiter, refresh);
router.post("/logout", logout);

export default router;
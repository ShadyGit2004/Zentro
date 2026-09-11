// Packages
import { Router } from "express";

// Middlewares
import authMiddleware from "../middlewares/auth.middleware";
import requireVerifiedEmail from "../middlewares/require-verified-email.middleware";

// Schema validator
import { updateProfileSchema } from "../validators/user.validator";

// Controllers
import { getMe, getUserProfile, updateUserProfile } from "../controllers/user.controller";
import validate from "../middlewares/validate.middleware";

const router = Router();

router.get(
  "/me",
  authMiddleware,
  requireVerifiedEmail,
  getMe
);

router.patch(
  "/me",
  authMiddleware,
  requireVerifiedEmail,
  validate(updateProfileSchema),
  updateUserProfile
);

router.get(
  "/:userId",
  getUserProfile
);

export default router;
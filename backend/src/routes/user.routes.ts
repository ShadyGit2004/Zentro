// Packages
import { Router } from "express";

// Middlewares
import authMiddleware from "../middlewares/auth.middleware";
import validate from "../middlewares/validate.middleware";
import requireVerifiedEmail from "../middlewares/require-verified-email.middleware";
import uploadProfileImage from "../middlewares/upload.middleware";

// Schema validator
import { updateProfileSchema } from "../validators/user.validator";

// Controllers
import { getMe, getUserProfile, updateUserProfile } from "../controllers/user.controller";
import { updateProfileImage } from "../controllers/user.controller";

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

router.patch(
  "/me/profile-image",
  authMiddleware,
  requireVerifiedEmail,
  uploadProfileImage.single("profileImage"),
  updateProfileImage
);

router.get(
  "/:userId",
  getUserProfile
);

export default router;
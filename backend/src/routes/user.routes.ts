// Packages
import { Router } from "express";

// Middlewares
import authMiddleware from "../middlewares/auth.middleware";
import validate from "../middlewares/validate.middleware";
import requireVerifiedEmail from "../middlewares/require-verified-email.middleware";
import uploadProfileImage from "../middlewares/upload.middleware";
import requireActiveUser from "../middlewares/require-active-user.middleware";

// Schema validator
import { searchUsersSchema } from "../validators/user.validator";
import { updateProfileSchema } from "../validators/user.validator";

// Controllers
import { getMe, getUserProfile, updateUserProfile, search, deleteUser, suspend, unsuspend } from "../controllers/user.controller";
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
  requireActiveUser,
  validate(updateProfileSchema),
  updateUserProfile
);

router.delete(
  "/me",
  authMiddleware,
  deleteUser
);

router.patch(
  "/me/profile-image",
  authMiddleware,
  requireVerifiedEmail,
  requireActiveUser,
  uploadProfileImage.single("profileImage"),
  updateProfileImage
);

router.get(
  "/search",
  validate(searchUsersSchema, "query"),
  search
);

router.get(
  "/:userId",
  getUserProfile
);

router.patch(
  "/:userId/suspend",
  authMiddleware,
  suspend
);

router.patch(
  "/:userId/unsuspend",
  authMiddleware,
  unsuspend
);

export default router;
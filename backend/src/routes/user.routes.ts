// Packages
import { Router } from "express";

// Middlewares
import authMiddleware from "../middlewares/auth.middleware";
import validate from "../middlewares/validate.middleware";
import requireVerifiedEmail from "../middlewares/require-verified-email.middleware";
import uploadProfileImage from "../middlewares/upload.middleware";
import requireActiveUser from "../middlewares/require-active-user.middleware";

// Schema validator
import { searchUsersSchema, updateNotificationPreferencesSchema, updateProfileSchema } from "../validators/user.validator";

// Controllers
import { getMe, getUserProfile, updateUserProfile, updateProfileImage, updateNotificationPreferences, search, getLoginHistory, deleteUser, suspend, unsuspend } from "../controllers/user.controller";
import { getMine as getMyBookmarks } from "../controllers/bookmark.controller";

const router = Router();

router.route("/me")
.get(authMiddleware, requireVerifiedEmail, getMe)
.patch(
  authMiddleware,
  requireVerifiedEmail,
  requireActiveUser,
  validate(updateProfileSchema),
  updateUserProfile
)
.delete(
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

router.patch(
  "/me/notification-preferences",
  authMiddleware,
  requireVerifiedEmail,
  validate(updateNotificationPreferencesSchema),
  updateNotificationPreferences
);

router.get(
  "/me/bookmarks",
  authMiddleware,
  requireActiveUser,
  requireVerifiedEmail,
  getMyBookmarks
);

router.get(
  "/me/login-history",
  authMiddleware,
  requireVerifiedEmail,
  getLoginHistory
);

router.get(
  "/search",
  validate(searchUsersSchema, "query"),
  search
);

router.get(
  "/:userId",
  authMiddleware,
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
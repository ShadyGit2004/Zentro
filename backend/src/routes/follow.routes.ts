import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import requireVerifiedEmail from "../middlewares/require-verified-email.middleware";
import requireActiveUser from "../middlewares/require-active-user.middleware";
import {
  follow,
  unfollow,
  followers,
  following,
} from "../controllers/follow.controller";

const router = Router({ mergeParams:true });

router.route("/follow")
.post(
  authMiddleware,
  requireActiveUser,
  requireVerifiedEmail,
  follow
)
.delete(
  authMiddleware,
  requireActiveUser,
  requireVerifiedEmail,
  unfollow
);

router.get(
  "/followers",
  authMiddleware,
  requireActiveUser,
  requireVerifiedEmail,
  followers
);

router.get(
  "/following",
  authMiddleware,
  requireActiveUser,
  requireVerifiedEmail,
  following
);

export default router;
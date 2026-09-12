import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import requireVerifiedEmail from "../middlewares/require-verified-email.middleware";
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
  requireVerifiedEmail,
  follow
)
.delete(
  authMiddleware,
  requireVerifiedEmail,
  unfollow
);

router.get(
  "/followers",
  followers
);

router.get(
  "/following",
  following
);

export default router;
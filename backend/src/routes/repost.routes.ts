import { Router } from "express";

import authMiddleware from "../middlewares/auth.middleware";
import requireVerifiedEmail from "../middlewares/require-verified-email.middleware";
import requireActiveUser from "../middlewares/require-active-user.middleware";

import { repost, unrepost } from "../controllers/repost.controller";

const router = Router({
  mergeParams: true,
});

router.route("/")
.post(
  authMiddleware,
  requireActiveUser,
  requireVerifiedEmail,
  repost
)
.delete(
  authMiddleware,
  requireActiveUser,
  requireVerifiedEmail,
  unrepost
);

export default router;

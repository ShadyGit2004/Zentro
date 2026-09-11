import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import requireVerifiedEmail from "../middlewares/require-verified-email.middleware";
import {
  follow,
  unfollow,
  followers,
  following,
} from "../controllers/follow.controller";

const router = Router();

router.post(
  "/users/:userId/follow",
  authMiddleware,
  requireVerifiedEmail,
  follow
);

router.delete(
  "/users/:userId/follow",
  authMiddleware,
  requireVerifiedEmail,
  unfollow
);

router.get(
  "/users/:userId/followers",
  followers
);

router.get(
  "/users/:userId/following",
  following
);

export default router;
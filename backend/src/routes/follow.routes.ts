import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import requireVerifiedEmail from "../middlewares/require-verified-email.middleware";
import {
  follow,
  unfollow,
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

export default router;
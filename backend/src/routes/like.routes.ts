import { Router } from "express";

import authMiddleware from "../middlewares/auth.middleware";
import requireVerifiedEmail from "../middlewares/require-verified-email.middleware";

import {
  like,
  unlike,
} from "../controllers/like.controller";

const router = Router({ mergeParams: true });

router
  .route("/")
  .post(
    authMiddleware,
    requireVerifiedEmail,
    like
  )
  .delete(
    authMiddleware,
    requireVerifiedEmail,
    unlike
  );

export default router;
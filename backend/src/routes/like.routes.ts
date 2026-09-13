import { Router } from "express";

import authMiddleware from "../middlewares/auth.middleware";
import requireVerifiedEmail from "../middlewares/require-verified-email.middleware";
import requireActiveUser from "../middlewares/require-active-user.middleware";

import {
  like,
  unlike,
} from "../controllers/like.controller";

const router = Router({ mergeParams: true });

router
  .route("/")
  .post(
    authMiddleware,
    requireActiveUser,
    requireVerifiedEmail,
    like
  )
  .delete(
    authMiddleware,
    requireActiveUser,
    requireVerifiedEmail,
    unlike
  );

export default router;
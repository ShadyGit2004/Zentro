import { Router } from "express";

import authMiddleware from "../middlewares/auth.middleware";
import requireVerifiedEmail from "../middlewares/require-verified-email.middleware";
import validate from "../middlewares/validate.middleware";

import {
  createCommentSchema,
} from "../validators/comment.validator";

import {
  create,
  getAll,
  remove
} from "../controllers/comment.controller";

const router = Router({ mergeParams: true, });

router
  .route("/")
  .post(
    authMiddleware,
    requireVerifiedEmail,
    validate(createCommentSchema),
    create
  )
  .get(getAll);

router.delete(
  "/:commentId",
  authMiddleware,
  requireVerifiedEmail,
  remove
);

export default router;
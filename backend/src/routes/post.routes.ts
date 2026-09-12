import { Router } from "express";

import authMiddleware from "../middlewares/auth.middleware";
import requireVerifiedEmail from "../middlewares/require-verified-email.middleware";
import validate from "../middlewares/validate.middleware";

import {
  createPostSchema,
  updatePostSchema,
  searchPostsSchema
} from "../validators/post.validator";

import {
  create,
  getById,
  update,
  remove,
  search
} from "../controllers/post.controller";

const router = Router();

router.post(
  "/",
  authMiddleware,
  requireVerifiedEmail,
  validate(createPostSchema),
  create
);

router.get(
  "/search",
  validate(searchPostsSchema, "query"),
  search
);

router.route("/:postId")
.get(
  getById
)
.patch( 
  authMiddleware,
  requireVerifiedEmail,
  validate(updatePostSchema),
  update
)
.delete(
  authMiddleware,
  requireVerifiedEmail,
  remove
);

export default router;
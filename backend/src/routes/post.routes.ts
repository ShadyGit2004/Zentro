import { Router } from "express";

// Middlewares
import authMiddleware from "../middlewares/auth.middleware";
import requireVerifiedEmail from "../middlewares/require-verified-email.middleware";
import requireActiveUser from "../middlewares/require-active-user.middleware";
import validate from "../middlewares/validate.middleware";
import uploadImage from "../middlewares/upload.middleware";

// Schemas
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
  requireActiveUser,
  requireVerifiedEmail,
  uploadImage.single("image"),
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
  requireActiveUser,
  requireVerifiedEmail,
  uploadImage.single("image"),
  validate(updatePostSchema),
  update
)
.delete(
  authMiddleware,
  requireActiveUser,
  requireVerifiedEmail,
  remove
);

export default router;
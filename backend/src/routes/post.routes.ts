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
  getPosts,
  update,
  remove,
  search
} from "../controllers/post.controller";

import {
  create as createBookmark,
  remove as removeBookmark,
} from "../controllers/bookmark.controller";

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
  "/user/:userId",
  authMiddleware,
  requireActiveUser,
  getPosts
);

router.get(
  "/search",
  validate(searchPostsSchema, "query"),
  search
);

router
  .route("/:postId/bookmark")
  .post(
    authMiddleware, 
    requireActiveUser, 
    requireVerifiedEmail, 
    createBookmark
  )
  .delete(
    authMiddleware,
    requireActiveUser,
    requireVerifiedEmail,
    removeBookmark
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
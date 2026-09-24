import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import requireActiveUser from "../middlewares/require-active-user.middleware";
import validate from "../middlewares/validate.middleware";
import {
  hashtagPostsSchema,
  searchHashtagsSchema,
} from "../validators/hashtag.validator";
import { getPosts, search } from "../controllers/hashtag.controller";

const router = Router();

router.get("/search", validate(searchHashtagsSchema, "query"), search);

router.get(
  "/:hashtag/posts",
  authMiddleware,
  requireActiveUser,
  validate(hashtagPostsSchema, "query"),
  getPosts
);

export default router;

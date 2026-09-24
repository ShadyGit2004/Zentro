import {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  getHashtagPosts,
  searchHashtags,
} from "../services/hashtag.service";
import AppError from "../utils/appError";

const getPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    }

    const hashtag = req.params.hashtag;

    if (typeof hashtag !== "string") {
       throw new AppError(400, "INVALID_HASHTAG", "Invalid hashtag");
    }    

    const limitValue = Number(req.query.limit);

    const limit = req.query.limit
        ? Math.min(Math.max(limitValue, 1), 50)
        : 20;

    if (!Number.isInteger(limit) || limit < 1) {
        throw new AppError(
        400,
        "INVALID_LIMIT",
        "Limit must be a positive integer"
        );
    }

    const cursor =
      typeof req.query.cursor === "string"
        ? req.query.cursor
        : undefined;

    const result = await getHashtagPosts(
      hashtag,
      req.user.userId,
      limit,
      cursor
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const search = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query =
      typeof req.query.q === "string"
        ? req.query.q
        : "";

   const limitValue = Number(req.query.limit);

   const limit = req.query.limit ? Math.min(Math.max(limitValue, 1), 50) : 20;

   if (!Number.isInteger(limit) || limit < 1) {
     throw new AppError(
       400,
       "INVALID_LIMIT",
       "Limit must be a positive integer"
     );
   }

    const hashtags = await searchHashtags(
      query,
      limit
    );

    res.status(200).json({
      success: true,
      data: hashtags,
    });
  } catch (error) {
    next(error);
  }
};

export {
  getPosts,
  search,
};
import { Request, Response, NextFunction } from "express";

import AppError from "../utils/appError";

import { repostPost, unrepostPost } from "../services/repost.service";

const repost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    }

    const { postId } = req.params;

    if (typeof postId !== "string") {
      throw new AppError(400, "INVALID_POST_ID", "Invalid post ID");
    }

    const result = await repostPost(req.user.userId, postId);

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const unrepost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    }

    const { postId } = req.params;

    if (typeof postId !== "string") {
      throw new AppError(400, "INVALID_POST_ID", "Invalid post ID");
    }

    const result = await unrepostPost(req.user.userId, postId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export { repost, unrepost };

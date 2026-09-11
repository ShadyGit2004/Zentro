import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError";
import {
  followUser,
  unfollowUser,
} from "../services/follow.service";

const follow = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError(
        401,
        "UNAUTHORIZED",
        "Authentication required"
      );
    }

    const { userId } = req.params;

    if (typeof userId !== "string") {
      throw new AppError(
        400,
        "INVALID_USER_ID",
        "Invalid user ID"
      );
    }

    const result = await followUser(
      req.user.userId,
      userId
    );

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const unfollow = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError(
        401,
        "UNAUTHORIZED",
        "Authentication required"
      );
    }

    const { userId } = req.params;

    if (typeof userId !== "string") {
      throw new AppError(
        400,
        "INVALID_USER_ID",
        "Invalid user ID"
      );
    }

    const result = await unfollowUser(
      req.user.userId,
      userId
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export {
  follow,
  unfollow,
};
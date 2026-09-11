import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError";
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
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

const followers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    if (typeof userId !== "string") {
      throw new AppError(
        400,
        "INVALID_USER_ID",
        "Invalid user ID"
      );
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

    const result = await getFollowers(
      userId,
      limit,
      cursor
    );

    return res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const following = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    if (typeof userId !== "string") {
      throw new AppError(
        400,
        "INVALID_USER_ID",
        "Invalid user ID"
      );
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

    const result = await getFollowing(
      userId,
      limit,
      cursor
    );

    return res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export {
  follow,
  unfollow,
  followers,
  following,
};
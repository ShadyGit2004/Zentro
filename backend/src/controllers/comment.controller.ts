import {
  Request,
  Response,
  NextFunction,
} from "express";

import AppError from "../utils/appError";

import {
  createComment,
  getComments,
  deleteComment,
} from "../services/comment.service";

const create = async (
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

    const { postId } = req.params;

    if (typeof postId !== "string") {
      throw new AppError(
        400,
        "INVALID_POST_ID",
        "Invalid post ID"
      );
    }

    const result = await createComment(
      req.user.userId,
      postId,
      req.body.content
    );

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { postId } = req.params;

    if (typeof postId !== "string") {
      throw new AppError(
        400,
        "INVALID_POST_ID",
        "Invalid post ID"
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

    const result = await getComments(
      postId,
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

const remove = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    }

    const { postId, commentId } = req.params;

    if (typeof postId !== "string") {
      throw new AppError(400, "INVALID_POST_ID", "Invalid post ID");
    }

    if (typeof commentId !== "string") {
      throw new AppError(400, "INVALID_COMMENT_ID", "Invalid comment ID");
    }

    const result = await deleteComment(
      req.user.userId,
      postId,
      commentId
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
  create,
  getAll,
  remove,
};
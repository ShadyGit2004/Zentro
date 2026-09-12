import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError";

import {
  createPost,
  getPostById,
  updatePost,
  deletePost,
  searchPosts
} from "../services/post.service";

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

    const result = await createPost(
      req.user.userId,
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

const getById = async (
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

    const result = await getPostById(postId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const update = async (
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

    const result = await updatePost(
      req.user.userId,
      postId,
      req.body.content
    );

    return res.status(200).json({
      success: true,
      data: result,
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

    const result = await deletePost(
      req.user.userId,
      postId
    );

    return res.status(200).json({
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
    const query = req.query.q;

    if (typeof query !== "string") {
      throw new AppError(
        400,
        "INVALID_SEARCH_QUERY",
        "Search query is required"
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

    const result = await searchPosts(query, limit, cursor);

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
  create,
  getById,
  update,
  remove,
  search
};
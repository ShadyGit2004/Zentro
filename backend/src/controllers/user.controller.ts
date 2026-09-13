import { Request, Response, NextFunction } from "express";
import { getCurrentUser,
  getPublicUserProfile, 
  updateCurrentUser as updateCurrentUserService,
  updateProfileImage as updateProfileImageService,
  searchUsers,
  deleteCurrentUser
 } from "../services/user.service";
import AppError from "../utils/appError";

const getMe = async (
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

    const user = await getCurrentUser(req.user.userId);

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const getUserProfile = async (
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

    const user = await getPublicUserProfile(userId);
    
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const updateUserProfile = async (
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

    const user = await updateCurrentUserService(
      req.user.userId,
      req.body
    );

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const updateProfileImage = async (
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

    if (!req.file) {
      throw new AppError(
        422,
        "IMAGE_REQUIRED",
        "Profile image is required"
      );
    }

    const result = await updateProfileImageService(
      req.user.userId,
      req.file
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

    const result = await searchUsers(query, limit, cursor);

    return res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    }

    const result = await deleteCurrentUser(req.user.userId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export { getMe, getUserProfile, updateUserProfile, updateProfileImage, search, deleteUser };
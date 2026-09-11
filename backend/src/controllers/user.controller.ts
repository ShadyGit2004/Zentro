import { Request, Response, NextFunction } from "express";
import { getCurrentUser,
  getPublicUserProfile, 
  updateCurrentUser as updateCurrentUserService,
  updateProfileImage as updateProfileImageService
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

export { getMe, getUserProfile, updateUserProfile, updateProfileImage };
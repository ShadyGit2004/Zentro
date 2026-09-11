import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError";
import User from "../models/user.model";

const requireVerifiedEmail = async (
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

    const user = await User.findById(req.user.userId)
      .select("emailVerifiedAt status")
      .lean();

    if (!user) {
      throw new AppError(
        401,
        "UNAUTHORIZED",
        "Authentication required"
      );
    }

    if (user.status !== "active") {
      throw new AppError(
        403,
        "ACCOUNT_UNAVAILABLE",
        "Account is not available"
      );
    }

    if (!user.emailVerifiedAt) {
      throw new AppError(
        403,
        "EMAIL_NOT_VERIFIED",
        "Please verify your email first"
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default requireVerifiedEmail;
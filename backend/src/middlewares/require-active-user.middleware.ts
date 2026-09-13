import { Request, Response, NextFunction } from "express";
import User from "../models/user.model";
import AppError from "../utils/appError";

const requireActiveUser = async (
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

    const user = await User.findOne({
      _id: req.user.userId,
      status: "active",
    })
      .select("_id")
      .lean();

    if (!user) {
      throw new AppError(
        403,
        "ACCOUNT_INACTIVE",
        "Account is not active"
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default requireActiveUser;
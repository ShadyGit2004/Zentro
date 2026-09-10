import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/auth";
import AppError from "../utils/appError";

interface AccessTokenPayload {
  userId: string;
}

const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      throw new AppError(
        401,
        "UNAUTHORIZED",
        "Authentication required"
      );
    }

    const token = authorization.split(" ")[1];

    if (!token) {
      throw new AppError(
        401,
        "UNAUTHORIZED",
        "Authentication required"
      );
    }

    const decoded = jwt.verify(
      token,
      JWT_SECRET
    ) as AccessTokenPayload;

    req.user = {
      userId: decoded.userId,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    if (error instanceof jwt.TokenExpiredError) {
      return next(
        new AppError(
          401,
          "ACCESS_TOKEN_EXPIRED",
          "Access token has expired"
        )
      );
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return next(
        new AppError(
          401,
          "INVALID_ACCESS_TOKEN",
          "Invalid access token"
        )
      );
    }

    next(error);
  }
};

export default authMiddleware;
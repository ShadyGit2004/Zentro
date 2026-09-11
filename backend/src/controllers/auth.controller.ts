import { Request, Response, NextFunction } from "express";
import {
  registerUser,
  loginUser,
  refreshUserSession,
  logoutUser,
  verifyEmail as verifyEmailService,
  resendVerificationEmail,
  forgotPassword as forgotPasswordService,
  resetPassword as resetPasswordService,
  googleLoginUser,
  updatePassword
} from "../services/auth.service";

import AppError from "../utils/appError";

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await registerUser(req.body);

    return res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await verifyEmailService(req.body.token);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const resendVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await resendVerificationEmail(req.body.email);

    return res.status(200).json({
      success: true,
      data: {
        message:
          "If the account exists and is not verified, a verification email has been sent",
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    
    const result = await loginUser(req.body, {
      userAgent: req.get("user-agent"),
      ipAddress: req.ip,
    });

    res.cookie("refreshToken", result.refreshToken, REFRESH_COOKIE_OPTIONS);

    return res.status(200).json({
      success: true,
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new AppError(401,"REFRESH_TOKEN_MISSING", "Refresh token is required");
    }

    const result = await refreshUserSession(refreshToken, {
      userAgent: req.get("user-agent"),
      ipAddress: req.ip,
    });

    res.cookie("refreshToken", result.refreshToken, REFRESH_COOKIE_OPTIONS);

    return res.status(200).json({
      success: true,
      data: {
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await logoutUser(refreshToken);
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await forgotPasswordService(req.body.email);

    return res.status(200).json({
      success: true,
      data: {
        message:
          "If the account exists, a password reset email has been sent",
      },
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await resetPasswordService(
      req.body.token,
      req.body.newPassword
    );

    return res.status(200).json({
      success: true,
      data: {
        message: "Password reset successfully",
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateUserPassword = async (
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

    const result = await updatePassword(
      req.user.userId,
      req.body.currentPassword,
      req.body.newPassword
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const googleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await googleLoginUser(
      req.body.idToken,
      {
        userAgent: req.get("user-agent"),
        ipAddress: req.ip,
      }
    );

    res.cookie(
      "refreshToken",
      result.refreshToken,
      REFRESH_COOKIE_OPTIONS
    );

    return res.status(200).json({
      success: true,
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export { register, googleLogin, verifyEmail, resendVerification, login, refresh, logout, forgotPassword, resetPassword, updateUserPassword}; 
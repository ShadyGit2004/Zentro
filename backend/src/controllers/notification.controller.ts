import { Request, Response, NextFunction } from "express";

import AppError from "../utils/appError";

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notification.service";

const getAll = async (
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

    const result = await getNotifications(
      req.user.userId,
      limit,
      cursor
    );

    return res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      unreadCount: result.unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (
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

    const { notificationId } = req.params;

    if (typeof notificationId !== "string") {
      throw new AppError(
        400,
        "INVALID_NOTIFICATION_ID",
        "Invalid notification ID"
      );
    }

    const notification = await markNotificationAsRead(
      req.user.userId,
      notificationId
    );

    return res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (
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

    const result = await markAllNotificationsAsRead(
      req.user.userId
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
  getAll,
  markAsRead,
  markAllAsRead,
};
import mongoose from "mongoose";

import Notification from "../models/notification.model";
import AppError from "../utils/appError";

type CreateNotificationInput = {
  recipient: string;
  actor: string;
  type: "like" | "comment" | "follow";
  post?: string;
  comment?: string;
};

const createNotification = async ({
  recipient,
  actor,
  type,
  post,
  comment,
}: CreateNotificationInput) => {
  if (recipient === actor) {
    return null;
  }

  const notification = await Notification.create({
    recipient,
    actor,
    type,
    post,
    comment,
  });

  return notification;
};

const getNotifications = async (
  userId: string,
  limit: number,
  cursor?: string
) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError(
      400,
      "INVALID_USER_ID",
      "Invalid user ID"
    );
  }

  if (cursor && !mongoose.isValidObjectId(cursor)) {
    throw new AppError(
      400,
      "INVALID_CURSOR",
      "Invalid cursor"
    );
  }

  const query: {
    recipient: string;
    _id?: {
      $lt: mongoose.Types.ObjectId;
    };
  } = {
    recipient: userId,
  };

  if (cursor) {
    query._id = {
      $lt: new mongoose.Types.ObjectId(cursor),
    };
  }

  const notifications = await Notification.find(query)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .populate({
      path: "actor",
      select: "_id username displayName profileImage",
      match: { status: "active" },
    })
    .populate({
      path: "post",
      select: "_id content media",
    })
    .populate({
      path: "comment",
      select: "_id content",
    })
    .lean();

  const hasNextPage = notifications.length > limit;

  if (hasNextPage) {
    notifications.pop();
  }

  const data = notifications.filter(
    (notification) => notification.actor
  );

  const nextCursor =
    hasNextPage && notifications.length > 0
      ? notifications[notifications.length - 1]._id.toString()
      : null;

  const unreadCount = await Notification.countDocuments({
    recipient: userId,
    isRead: false,
  });

  return {
    data,
    pagination: {
      nextCursor,
      hasNextPage,
    },
    unreadCount,
  };
};

const markNotificationAsRead = async (
  userId: string,
  notificationId: string
) => {
  if (!mongoose.isValidObjectId(notificationId)) {
    throw new AppError(
      400,
      "INVALID_NOTIFICATION_ID",
      "Invalid notification ID"
    );
  }

  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      recipient: userId,
    },
    {
      $set: {
        isRead: true,
      },
    },
    {
      new: true,
    }
  );

  if (!notification) {
    throw new AppError(
      404,
      "NOTIFICATION_NOT_FOUND",
      "Notification not found"
    );
  }

  return notification;
};

const markAllNotificationsAsRead = async (
  userId: string
) => {
  await Notification.updateMany(
    {
      recipient: userId,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
      },
    }
  );

  return {
    message: "All notifications marked as read",
  };
};

export {
  createNotification,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
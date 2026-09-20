import mongoose from "mongoose";
import Follow from "../models/follow.model";
import User from "../models/user.model";
import AppError from "../utils/appError";
import { createNotification } from "./notification.service";
import Notification from "../models/notification.model";

const followUser = async (
  followerId: string,
  followingId: string
) => {
  if (!mongoose.isValidObjectId(followingId)) {
    throw new AppError(
      400,
      "INVALID_USER_ID",
      "Invalid user ID"
    );
  }

  if (followerId === followingId) {
    throw new AppError(
      400,
      "SELF_FOLLOW_NOT_ALLOWED",
      "You cannot follow yourself"
    );
  }

  const targetUser = await User.findById(followingId)
    .select("_id status")
    .lean();

  if (!targetUser || targetUser.status !== "active") {
    throw new AppError(
      404,
      "USER_NOT_FOUND",
      "User not found"
    );
  }

  const existingFollow = await Follow.findOne({
    follower: followerId,
    following: followingId,
  }).lean();

  if (existingFollow) {
    throw new AppError(
      409,
      "ALREADY_FOLLOWING",
      "You are already following this user"
    );
  }

  await Follow.create({
    follower: followerId,
    following: followingId,
  });

  await createNotification({
    recipient: followingId,
    actor: followerId,
    type: "follow",
  });

  return {
    message: "User followed successfully",
  };
};

const unfollowUser = async (
  followerId: string,
  followingId: string
) => {
  if (!mongoose.isValidObjectId(followingId)) {
    throw new AppError(
      400,
      "INVALID_USER_ID",
      "Invalid user ID"
    );
  }

  const targetUser = await User.findById(followingId)
    .select("_id status")
    .lean();

  if (!targetUser || targetUser.status !== "active") {
    throw new AppError(
      404,
      "USER_NOT_FOUND",
      "User not found"
    );
  }

  const deletedFollow = await Follow.findOneAndDelete({
    follower: followerId,
    following: followingId,
  });  

  if (!deletedFollow) {
    throw new AppError(
      404,
      "NOT_FOLLOWING",
      "You are not following this user"
    );
  }

  await Notification.deleteMany({
    recipient: followingId,
    actor: followerId,
    type: "follow",
  });

  return {
    message: "User unfollowed successfully",
  };
};

const getFollowers = async (
  userId: string,
  currentUserId: string,
  limit: number,
  cursor?: string
) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError(400, "INVALID_USER_ID", "Invalid user ID");
  }

  if (!mongoose.isValidObjectId(currentUserId)) {
    throw new AppError(400, "INVALID_USER_ID", "Invalid current user ID");
  }

  const user = await User.findOne({
    _id: userId,
    status: "active",
  })
    .select("_id")
    .lean();

  if (!user) {
    throw new AppError(404, "USER_NOT_FOUND", "User not found");
  }

  if (cursor && !mongoose.isValidObjectId(cursor)) {
    throw new AppError(400, "INVALID_CURSOR", "Invalid cursor");
  }

  const match: Record<string, unknown> = {
    following: new mongoose.Types.ObjectId(userId),
  };

  if (cursor) {
    match._id = {
      $lt: new mongoose.Types.ObjectId(cursor),
    };
  }

  const follows = await Follow.aggregate([
    {
      $match: match,
    },

    {
      $sort: {
        _id: -1,
      },
    },

    {
      $limit: limit + 1,
    },

    {
      $lookup: {
        from: "users",
        let: { followerId: "$follower" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$followerId"],
              },
              status: "active",
            },
          },
          {
            $project: {
              _id: 1,
              username: 1,
              displayName: 1,
              bio: 1,
              profileImage: 1,
            },
          },
        ],
        as: "follower",
      },
    },

    {
      $unwind: "$follower",
    },

    {
      $lookup: {
        from: "follows",
        let: {
          targetUserId: "$follower._id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: [
                      "$follower",
                      new mongoose.Types.ObjectId(currentUserId),
                    ],
                  },
                  {
                    $eq: ["$following", "$$targetUserId"],
                  },
                ],
              },
            },
          },
          {
            $limit: 1,
          },
        ],
        as: "currentUserFollow",
      },
    },

    {
      $addFields: {
        "follower.isFollowing": {
          $gt: [{ $size: "$currentUserFollow" }, 0],
        },
      },
    },

    {
      $project: {
        _id: 1,
        follower: 1,
      },
    },
  ]);

  const hasNextPage = follows.length > limit;

  if (hasNextPage) {
    follows.pop();
  }

  const data = follows.map((follow) => follow.follower);

  const nextCursor =
    hasNextPage && follows.length > 0
      ? follows[follows.length - 1]._id.toString()
      : null;

  return {
    data,
    pagination: {
      nextCursor,
      hasNextPage,
    },
  };
};

const getFollowing = async (
  userId: string,
  currentUserId: string,
  limit: number,
  cursor?: string
) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError(400, "INVALID_USER_ID", "Invalid user ID");
  }

  if (!mongoose.isValidObjectId(currentUserId)) {
    throw new AppError(400, "INVALID_USER_ID", "Invalid current user ID");
  }

  const user = await User.findOne({
    _id: userId,
    status: "active",
  })
    .select("_id")
    .lean();

  if (!user) {
    throw new AppError(404, "USER_NOT_FOUND", "User not found");
  }

  if (cursor && !mongoose.isValidObjectId(cursor)) {
    throw new AppError(400, "INVALID_CURSOR", "Invalid cursor");
  }

  const match: Record<string, unknown> = {
    follower: new mongoose.Types.ObjectId(userId),
  };

  if (cursor) {
    match._id = {
      $lt: new mongoose.Types.ObjectId(cursor),
    };
  }

  const follows = await Follow.aggregate([
    {
      $match: match,
    },

    {
      $sort: {
        _id: -1,
      },
    },

    {
      $limit: limit + 1,
    },

    {
      $lookup: {
        from: "users",
        let: { followingId: "$following" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$_id", "$$followingId"],
              },
              status: "active",
            },
          },
          {
            $project: {
              _id: 1,
              username: 1,
              displayName: 1,
              bio: 1,
              profileImage: 1,
            },
          },
        ],
        as: "following",
      },
    },

    {
      $unwind: "$following",
    },

    {
      $lookup: {
        from: "follows",
        let: {
          targetUserId: "$following._id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: [
                      "$follower",
                      new mongoose.Types.ObjectId(currentUserId),
                    ],
                  },
                  {
                    $eq: ["$following", "$$targetUserId"],
                  },
                ],
              },
            },
          },
          {
            $limit: 1,
          },
        ],
        as: "currentUserFollow",
      },
    },

    {
      $addFields: {
        "following.isFollowing": {
          $gt: [{ $size: "$currentUserFollow" }, 0],
        },
      },
    },

    {
      $project: {
        _id: 1,
        following: 1,
      },
    },
  ]);

  const hasNextPage = follows.length > limit;

  if (hasNextPage) {
    follows.pop();
  }

  const data = follows.map((follow) => follow.following);

  const nextCursor =
    hasNextPage && follows.length > 0
      ? follows[follows.length - 1]._id.toString()
      : null;

  return {
    data,
    pagination: {
      nextCursor,
      hasNextPage,
    },
  };
};

export {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
};
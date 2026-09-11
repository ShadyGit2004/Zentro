import mongoose from "mongoose";
import Follow from "../models/follow.model";
import User from "../models/user.model";
import AppError from "../utils/appError";

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

  return {
    message: "User unfollowed successfully",
  };
};

const getFollowers = async (
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

  const user = await User.findOne({
    _id: userId,
    status: "active",
  })
    .select("_id")
    .lean();

  if (!user) {
    throw new AppError(
      404,
      "USER_NOT_FOUND",
      "User not found"
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
    following: string;
    _id?: { $lt: mongoose.Types.ObjectId };
  } = {
    following: userId,
  };

  if (cursor) {
    query._id = {
      $lt: new mongoose.Types.ObjectId(cursor),
    };
  }

  const follows = await Follow.find(query)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .populate({
      path: "follower",
      select: "_id username displayName bio profileImage",
      match: { status: "active" },
    })
    .lean();

  const hasNextPage = follows.length > limit;

  if (hasNextPage) {
    follows.pop();
  }

  const data = follows
    .filter((follow) => follow.follower)
    .map((follow) => follow.follower);

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

  const user = await User.findOne({
    _id: userId,
    status: "active",
  })
    .select("_id")
    .lean();

  if (!user) {
    throw new AppError(
      404,
      "USER_NOT_FOUND",
      "User not found"
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
    follower: string;
    _id?: { $lt: mongoose.Types.ObjectId };
  } = {
    follower: userId,
  };

  if (cursor) {
    query._id = {
      $lt: new mongoose.Types.ObjectId(cursor),
    };
  }

  const follows = await Follow.find(query)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .populate({
      path: "following",
      select: "_id username displayName bio profileImage",
      match: { status: "active" },
    })
    .lean();

  const hasNextPage = follows.length > limit;

  if (hasNextPage) {
    follows.pop();
  }

  const data = follows
    .filter((follow) => follow.following)
    .map((follow) => follow.following);

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
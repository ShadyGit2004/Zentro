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

export {
  followUser,
  unfollowUser,
};
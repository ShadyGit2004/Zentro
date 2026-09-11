import mongoose from "mongoose";
import User from "../models/user.model";
import AppError from "../utils/appError";

const getCurrentUser = async (userId: string) => {
  const user = await User.findById(userId).select(
    "-passwordHash"
  ).lean();

  if (!user || user.status !== "active") {
    throw new AppError(
      404,
      "USER_NOT_FOUND",
      "User not found"
    );
  }

  return {
    id: user._id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    profileImage: user.profileImage,
    authProviders: user.authProviders,
    emailVerifiedAt: user.emailVerifiedAt,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  };
};

const getPublicUserProfile = async (userId: string) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError(
      400,
      "INVALID_USER_ID",
      "Invalid user ID"
    );
  }

  const user = await User.findById(userId)
    .select(
      "username displayName bio profileImage createdAt updatedAt status"
    )
    .lean();

    console.log(user)

  if (!user || user.status !== "active") {
    throw new AppError(
      404,
      "USER_NOT_FOUND",
      "User not found"
    );
  }

  return user;
};

const updateCurrentUser = async (
  userId: string,
  data: {
    username?: string;
    displayName?: string;
    bio?: string;
  }
) => {
  const user = await User.findById(userId);

  if (!user || user.status !== "active") {
    throw new AppError(
      401,
      "UNAUTHORIZED",
      "Authentication required"
    );
  }

  if (data.username && data.username !== user.username) {
    const existingUser = await User.findOne({
      username: data.username,
      _id: { $ne: user._id },
    });

    if (existingUser) {
      throw new AppError(
        409,
        "USERNAME_ALREADY_EXISTS",
        "Username is already taken"
      );
    }

    user.username = data.username;
  }

  if (data.displayName !== undefined) {
    user.displayName = data.displayName;
  }

  if (data.bio !== undefined) {
    user.bio = data.bio;
  }

  await user.save();

  return {
    id: user._id,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    profileImage: user.profileImage,
    updatedAt: user.updatedAt,
  };
};

export { getCurrentUser, getPublicUserProfile, updateCurrentUser, };
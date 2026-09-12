import mongoose from "mongoose";
import User, {IUser} from "../models/user.model";
import AppError from "../utils/appError";

// Services
import { uploadProfileImage as uploadToCloudinary } from "./cloudinary.service";

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

const updateProfileImage = async (
  userId: string,
  file: Express.Multer.File
) => {
  const user = await User.findById(userId);

  if (!user || user.status !== "active") {
    throw new AppError(
      401,
      "UNAUTHORIZED",
      "Authentication required"
    );
  }

  const result = await uploadToCloudinary(
    file.buffer,
    userId
  );

  user.profileImage = {
    url: result.secure_url,
    publicId: result.public_id,
  };

  await user.save();

  return {
    profileImage: user.profileImage,
  };
};

const searchUsers = async (
  query: string,
  limit: number,
  cursor?: string
) => {
  const searchQuery = query.trim();

  if (searchQuery.length < 2) {
    throw new AppError(
      400,
      "INVALID_SEARCH_QUERY",
      "Search query must be at least 2 characters"
    );
  }

  if (cursor && !mongoose.isValidObjectId(cursor)) {
    throw new AppError(400, "INVALID_CURSOR", "Invalid cursor");
  }

  const searchRegex = new RegExp(
    searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    "i"
  );

  const dbQuery: mongoose.QueryFilter<IUser> = {
    status: "active",
    $or: [
      { username: searchRegex },
      { displayName: searchRegex },
    ],
  };

  if (cursor) {
    dbQuery._id = {
      $lt: new mongoose.Types.ObjectId(cursor),
    };
  }

  const users = await User.find(dbQuery)
    .select("_id username displayName bio profileImage")
    .sort({ _id: -1 })
    .limit(limit + 1)
    .lean();

  const hasNextPage = users.length > limit;

  if (hasNextPage) {
    users.pop();
  }

  const nextCursor =
    hasNextPage && users.length > 0
      ? users[users.length - 1]._id.toString()
      : null;

  return {
    data: users,
    pagination: {
      nextCursor,
      hasNextPage,
    },
  };
};

export { getCurrentUser, getPublicUserProfile, updateCurrentUser, updateProfileImage, searchUsers};
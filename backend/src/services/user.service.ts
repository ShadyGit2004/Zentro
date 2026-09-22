import mongoose from "mongoose";
import User, {IUser} from "../models/user.model";
import Post from "../models/post.model";
import Like from "../models/like.model";
import Comment from "../models/comment.model";
import Follow from "../models/follow.model";
import Notification from "../models/notification.model";
import Session from "../models/session.model";
import VerificationToken from "../models/verification-token.model";
import PasswordResetToken from "../models/password-reset-token.model";
import AppError from "../utils/appError";

// Services
import { deleteCloudinaryImage, getOptimizedProfileImageUrl, uploadProfileImage as uploadToCloudinary } from "./cloudinary.service";
import Bookmark from "../models/bookmark.model";
import Repost from "../models/repost.model";

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

const getPublicUserProfile = async (userId: string, currUserId:string) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError(
      400,
      "INVALID_USER_ID",
      "Invalid user ID"
    );
  }
  
  const user = await User.aggregate([
  {
    $match: {
      _id: new mongoose.Types.ObjectId(userId),
      status: "active",
    },
  },

  // Followers count
  {
    $lookup: {
      from: "follows",
      let: { userId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$following", "$$userId"] },
          },
        },
        { $count: "count" },
      ],
      as: "followers",
    },
  },

  // Following count
  {
    $lookup: {
      from: "follows",
      let: { userId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$follower", "$$userId"] },
          },
        },
        { $count: "count" },
      ],
      as: "following",
    },
  },

  // Posts count
  {
    $lookup: {
      from: "posts",
      let: { userId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$author", "$$userId"] },
          },
        },
        { $count: "count" },
      ],
      as: "posts",
    },
  },

  // Is current user following this profile?
  {
    $lookup: {
      from: "follows",
      let: { userId: "$_id" },
      pipeline: [
        {
          $match: {
            
            $expr: {
              $and: [
                { $eq: ["$follower", new mongoose.Types.ObjectId(currUserId)] },
                { $eq: ["$following", "$$userId"] },
              ],
            },
          },
        },
        { $limit: 1 },
      ],
      as: "followingStatus",
    },
  },

  {
    $addFields: {
      followersCount: {
        $ifNull: [{ $arrayElemAt: ["$followers.count", 0] }, 0],
      },
      followingCount: {
        $ifNull: [{ $arrayElemAt: ["$following.count", 0] }, 0],
      },
      postsCount: {
        $ifNull: [{ $arrayElemAt: ["$posts.count", 0] }, 0],
      },
      isFollowing: {
        $gt: [{ $size: "$followingStatus" }, 0],
      },
    },
  },

  {
    $project: {
      _id: 1,
      username: 1,
      displayName: 1,
      bio: 1,
      profileImage: 1,
      createdAt: 1,
      updatedAt: 1,
      status: 1,
      followersCount: 1,
      followingCount: 1,
      postsCount: 1,
      isFollowing: 1,
    },
  },
]);

  // const user = await User.findById(userId)
  //   .select(
  //     "username displayName bio profileImage createdAt updatedAt status"
  //   )
  //   .lean();

  if (!user[0] || user[0].status !== "active") {
    throw new AppError(
      404,
      "USER_NOT_FOUND",
      "User not found"
    );
  }

  return {
    id : user[0]._id,
    username: user[0].username,
    displayName : user[0].displayName,
    bio : user[0].bio,
    profileImage : user[0].profileImage,
    createdAt : user[0].createdAt,
    updatedAt : user[0].updatedAt,
    status : user[0].status,
    postsCount : user[0].postsCount,
    isFollowing : user[0].isFollowing,
    followersCount: user[0].followersCount,
    followingCount: user[0].followingCount
  };
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

  const uploadedImage = await uploadToCloudinary(
    file.buffer,
    userId.toString()
  );

  const optimizedUrl = getOptimizedProfileImageUrl(
    uploadedImage.public_id,
    uploadedImage.version
  );

  const newProfileImage = {
    url: optimizedUrl,
    publicId: uploadedImage.public_id,
  };

  try {
    user.profileImage = newProfileImage;

    await user.save();
  } catch (error) {
    await deleteCloudinaryImage(newProfileImage.publicId);
    throw error;
  }

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

const suspendUser = async (adminId: string, userId: string) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError(400, "INVALID_USER_ID", "Invalid user ID");
  }

   // Admin cannot suspend himself
  if (adminId === userId) {
    throw new AppError(
      400,
      "SELF_SUSPEND_NOT_ALLOWED",
      "You cannot suspend yourself"
    );
  }

  // Check admin
  const admin = await User.findOne({
    _id: adminId,
    role: "admin",
    status: "active",
  })
    .select("_id")
    .lean();

  if (!admin) {
    throw new AppError(403, "FORBIDDEN", "Admin access required");
  } 

  const user = await User.findById(userId)
    .select("_id status role")
    .lean();

  if (!user || user.status === "deleted") {
    throw new AppError(404, "USER_NOT_FOUND", "User not found");
  }

  // Don't allow suspending another admin
  if (user.role === "admin") {
    throw new AppError(
      403,
      "ADMIN_SUSPEND_NOT_ALLOWED",
      "Admin users cannot be suspended"
    );
  }

  if (user.status === "suspended") {
    throw new AppError(
      409,
      "USER_ALREADY_SUSPENDED",
      "User is already suspended"
    );
  }

  await User.updateOne(
    { _id: userId },
    { $set: { status: "suspended" } }
  );

  // Revoke all active sessions
  await Session.updateMany(
    {
      user: userId,
      revokedAt: null,
    },
    {
      $set: { revokedAt: new Date() },
    }
  );

  return {
    message: "User suspended successfully",
  };
};

const unsuspendUser = async (adminId: string, userId: string) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError(400, "INVALID_USER_ID", "Invalid user ID");
  }

    // Admin cannot suspend himself
  if (adminId === userId) {
    throw new AppError(
      400,
      "SELF_UNSUSPEND_NOT_ALLOWED",
      "You cannot unsuspend yourself"
    );
  }

  const admin = await User.findOne({
    _id: adminId,
    role: "admin",
    status: "active",
  })
    .select("_id")
    .lean();

  if (!admin) {
    throw new AppError(403, "FORBIDDEN", "Admin access required");
  }

  const user = await User.findById(userId)
    .select("_id status")
    .lean();

  if (!user || user.status === "deleted") {
    throw new AppError(404, "USER_NOT_FOUND", "User not found");
  }

  if (user.status === "active") {
    throw new AppError(
      409,
      "USER_ALREADY_ACTIVE",
      "User is already active"
    );
  }

  await User.updateOne(
    { _id: userId },
    { $set: { status: "active" } }
  );

  return {
    message: "User unsuspended successfully",
  };
};

const deleteCurrentUser = async (userId: string) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError(400, "INVALID_USER_ID", "Invalid user ID");
  }

  const user = await User.findById(userId)
    .select("_id status profileImage")
    .lean();

  if (!user || user.status === "deleted") {
    throw new AppError(404, "USER_NOT_FOUND", "User not found");
  }

  // Collect posts and media IDs before deleting anything
  const posts = await Post.find({
    author: userId,
  })
    .select("_id media")
    .lean();

  const postIds = posts.map((post) => post._id);

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    if (postIds.length > 0) {
      await Like.deleteMany(
        { post: { $in: postIds } },
        { session }
      );

      await Comment.deleteMany(
        { post: { $in: postIds } },
        { session }
      );

      await Notification.deleteMany(
        { post: { $in: postIds } },
        { session }
      );

      await Post.deleteMany(
        { author: userId },
        { session }
      );

      await Repost.deleteMany(
        { author: userId },
        { session }
      );
    }

    await Like.deleteMany(
      { user: userId },
      { session }
    );

    await Comment.deleteMany(
      { author: userId },
      { session }
    );

    await Bookmark.deleteMany({ user: userId }, { session });

    await Follow.deleteMany(
      {
        $or: [
          { follower: userId },
          { following: userId },
        ],
      },
      { session }
    );

    await Notification.deleteMany(
      {
        $or: [
          { recipient: userId },
          { actor: userId },
        ],
      },
      { session }
    );

    await Session.deleteMany(
      { user: userId },
      { session }
    );

    await VerificationToken.deleteMany(
      { user: userId },
      { session }
    );

    await PasswordResetToken.deleteMany(
      { user: userId },
      { session }
    );

    await User.deleteOne(
      { _id: userId },
      { session }
    );

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }

  // MongoDB committed successfully → now clean Cloudinary
  for (const post of posts) {
    if (post.media?.publicId) {
      await deleteCloudinaryImage(post.media.publicId);
    }
  }

  if (user.profileImage?.publicId) {
    await deleteCloudinaryImage(user.profileImage.publicId);
  }

  return {
    message: "Account deleted successfully",
  };
};

export { getCurrentUser, getPublicUserProfile, updateCurrentUser, updateProfileImage, searchUsers, deleteCurrentUser,suspendUser, unsuspendUser};
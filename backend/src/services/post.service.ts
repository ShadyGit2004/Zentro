import mongoose from "mongoose";
import Post, {IPost} from "../models/post.model";
import User from "../models/user.model";
import Like from "../models/like.model";
import Comment from "../models/comment.model";
import Notification from "../models/notification.model";
import AppError from "../utils/appError";
import {
  uploadPostImage,
  uploadPostAudio,
  deleteCloudinaryPostMedia,
  getOptimizedPostImageUrl,
} from "./cloudinary.service";
import Bookmark from "../models/bookmark.model";
import Repost from "../models/repost.model";
import Hashtag from "../models/hashtag.model";
import extractHashtags from "../utils/hashtag.utils";
import { checkPostLimit } from "./payment/payment.service";

const syncHashtags = async (
  oldHashtagIds: mongoose.Types.ObjectId[],
  newHashtagNames: string[],
  session?: mongoose.ClientSession
) => {
  const oldIds = oldHashtagIds.map((id) => id.toString());

  const newHashtags = await Promise.all(
    newHashtagNames.map(async (name) => {
      return Hashtag.findOneAndUpdate(
        { name },
        {
          $setOnInsert: {
            name,
          },
        },
        {
          new: true,
          upsert: true,
          session,
        }
      );
    })
  );

  const newHashtagIds = newHashtags.map((hashtag) => hashtag!._id);

  const newIds = newHashtagIds.map((id) => id.toString());

  const addedIds = newHashtagIds.filter(
    (id) => !oldIds.includes(id.toString())
  );

  const removedIds = oldHashtagIds.filter(
    (id) => !newIds.includes(id.toString())
  );

  if (addedIds.length > 0) {
    await Hashtag.updateMany(
      { _id: { $in: addedIds } },
      { $inc: { postsCount: 1 } },
      { session }
    );
  }

  if (removedIds.length > 0) {
    await Hashtag.updateMany(
      { _id: { $in: removedIds } },
      {
        $inc: {
          postsCount: -1,
        },
      },
      { session }
    );
  }

  return newHashtagIds;
};

const createPost = async (
  userId: string,
  content?: string,
  file?: Express.Multer.File
) => {
  const user = await User.findOne({
    _id: userId,
    status: "active",
  })
    .select("_id")
    .lean();

  if (!user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }

  if (!content && !file) {
    throw new AppError(400, "EMPTY_POST", "Post must contain text or media");
  }

  const session = await mongoose.startSession();

  let post!: mongoose.HydratedDocument<IPost>;
  let hashtagIds: mongoose.Types.ObjectId[] = [];
  const hashtagNames = extractHashtags(content);

  try {
    await session.withTransaction(async () => {
      // Force concurrent post creations for the same user
      // to conflict and retry at the transaction level.
      await User.updateOne(
        {
          _id: userId,
          status: "active",
        },
        {
          $inc: {
            postCreationVersion: 1,
          },
        },
        { session }
      );

      await checkPostLimit(userId, session);

      hashtagIds = await syncHashtags([], hashtagNames, session);

      const posts = await Post.create(
        [
          {
            author: userId,
            content,
            hashtags: hashtagIds,
          },
        ],
        { session }
      );

      post = posts[0];
    });
  } finally {
    await session.endSession();
  }

  // Cloudinary is intentionally outside the DB transaction.
  if (file) {
    let uploadedPublicId: string | undefined;
    const isAudio = file.mimetype.startsWith("audio/");

    try {
      const uploadedMedia = isAudio
        ? await uploadPostAudio(file.buffer, post._id.toString())
        : await uploadPostImage(file.buffer, post._id.toString());

      uploadedPublicId = uploadedMedia.public_id;

      post.media = {
        type: isAudio ? "audio" : "image",
        url: isAudio
          ? uploadedMedia.secure_url
          : getOptimizedPostImageUrl(uploadedMedia.public_id, uploadedMedia.version),
        publicId: uploadedMedia.public_id,
      };

      await post.save();
    } catch (error) {
      await Post.deleteOne({ _id: post._id });

      if (hashtagIds.length > 0) {
        await Hashtag.updateMany(
          { _id: { $in: hashtagIds } },
          { $inc: { postsCount: -1 } }
        );
      }

      if (uploadedPublicId) {
        try {
          await deleteCloudinaryPostMedia(
            uploadedPublicId,
            isAudio ? "audio" : "image"
          );
        } catch (cleanupError) {
          console.error(
            "Failed to cleanup uploaded post media from Cloudinary:",
            cleanupError
          );
        }
      }

      throw error;
    }
  }

  return {
    id: post._id,
    author: userId,
    content: post.content,
    hashtags: hashtagNames,
    media: post.media,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
};

const getPostById = async (postId: string) => {
  if (!mongoose.isValidObjectId(postId)) {
    throw new AppError(
      400,
      "INVALID_POST_ID",
      "Invalid post ID"
    );
  }

  const post = await Post.findById(postId)
    .populate({
      path: "author",
      select: "_id username displayName bio profileImage",
      match: { status: "active" },
    })
    .populate({
      path: "hashtags",
      select: "_id name",
    })
    .lean();

  if (!post || !post.author) {
    throw new AppError(
      404,
      "POST_NOT_FOUND",
      "Post not found"
    );
  }

  return post;
};

const getUserPosts = async (
  userId: string,
  currentUserId: string,
  limit: number,
  cursor?: string
) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError(400, "INVALID_USER_ID", "Invalid user ID");
  }

  if (cursor && !mongoose.isValidObjectId(cursor)) {
    throw new AppError(400, "INVALID_CURSOR", "Invalid cursor");
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

  const loggedInUserId = new mongoose.Types.ObjectId(currentUserId);

  const dbQuery: mongoose.QueryFilter<IPost> = {
    author: new mongoose.Types.ObjectId(userId),
  };

  if (cursor) {
    dbQuery._id = {
      $lt: new mongoose.Types.ObjectId(cursor),
    };
  }
  
  const posts = await Post.aggregate([
    {
      $match: dbQuery,
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
        localField: "author",
        foreignField: "_id",
        as: "author",
      },
    },

    {
      $unwind: "$author",
    },

    {
      $match: {
        "author.status": "active",
      },
    },

    {
      $lookup: {
        from: "likes",
        let: {
          postId: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$post", "$$postId"],
              },
            },
          },
          {
            $count: "count",
          },
        ],
        as: "likes",
      },
    },

    {
      $lookup: {
        from: "comments",
        let: {
          postId: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$post", "$$postId"],
              },
            },
          },
          {
            $count: "count",
          },
        ],
        as: "comments",
      },
    },

    {
      $lookup: {
        from: "likes",
        let: {
          postId: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$post", "$$postId"] },
                  { $eq: ["$user", loggedInUserId] },
                ],
              },
            },
          },
          {
            $limit: 1,
          },
        ],
        as: "userLike",
      },
    },

    {
      $lookup: {
        from: "bookmarks",
        let: {
          postId: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$post", "$$postId"] },
                  { $eq: ["$user", loggedInUserId] },
                ],
              },
            },
          },
          {
            $limit: 1,
          },
        ],
        as: "userBookmark",
      },
    },

    {
      $lookup: {
        from: "reposts",
        let: {
          postId: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$post", "$$postId"],
              },
            },
          },
          {
            $count: "count",
          },
        ],
        as: "reposts",
      },
    },

    {
      $lookup: {
        from: "reposts",
        let: {
          postId: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$post", "$$postId"] },
                  { $eq: ["$user", loggedInUserId] },
                ],
              },
            },
          },
          {
            $limit: 1,
          },
        ],
        as: "userRepost",
      },
    },

    {
      $lookup: {
        from: "hashtags",
        localField: "hashtags",
        foreignField: "_id",
        as: "hashtags",
      },
    },

    {
      $project: {
        _id: 1,
        content: 1,
        media: 1,
        createdAt: 1,
        updatedAt: 1,

        author: {
          _id: "$author._id",
          username: "$author.username",
          displayName: "$author.displayName",
          profileImage: "$author.profileImage",
        },

        likesCount: {
          $ifNull: [{ $arrayElemAt: ["$likes.count", 0] }, 0],
        },

        commentsCount: {
          $ifNull: [{ $arrayElemAt: ["$comments.count", 0] }, 0],
        },

        repostsCount: {
          $ifNull: [{ $arrayElemAt: ["$reposts.count", 0] }, 0],
        },

        isReposted: {
          $gt: [{ $size: "$userRepost" }, 0],
        },

        isLiked: {
          $gt: [{ $size: "$userLike" }, 0],
        },

        isBookmarked: {
          $gt: [{ $size: "$userBookmark" }, 0],
        },

        hashtags: {
          $map: {
            input: "$hashtags",
            as: "hashtag",
            in: {
              _id: "$$hashtag._id",
              name: "$$hashtag.name",
            },
          },
        },
      },
    },
  ]);

  const hasNextPage = posts.length > limit;

  if (hasNextPage) {
    posts.pop();
  }

  const nextCursor =
    hasNextPage && posts.length > 0
      ? posts[posts.length - 1]._id.toString()
      : null;

  return {
    data: posts,
    pagination: {
      nextCursor,
      hasNextPage,
    },
  };
};

const updatePost = async (
  userId: string,
  postId: string,
  content?: string,
  file?: Express.Multer.File
) => {
  if (!mongoose.isValidObjectId(postId)) {
    throw new AppError(
      400,
      "INVALID_POST_ID",
      "Invalid post ID"
    );
  }

  const post = await Post.findById(postId);

  if (!post) {
    throw new AppError(
      404,
      "POST_NOT_FOUND",
      "Post not found"
    );
  }

  if (post.author.toString() !== userId) {
    throw new AppError(
      403,
      "FORBIDDEN",
      "You are not allowed to update this post"
    );
  }

  if (content === undefined && !file) {
    throw new AppError(
      400,
      "NO_UPDATE_DATA",
      "Provide content or media to update"
    );
  }

  const oldPublicId = post.media?.publicId;
  const oldMediaType = post.media?.type;

  if (content !== undefined) {    
    const oldHashtagIds = post.hashtags ?? [];
    const hashtagNames = extractHashtags(content);

    const updatedHashtags = await syncHashtags(oldHashtagIds, hashtagNames);

    post.content = content;
    post.hashtags = updatedHashtags;
  }

  if (file) {
    const isAudio = file.mimetype.startsWith("audio/");
    const uploadedMedia = isAudio
      ? await uploadPostAudio(file.buffer, post._id.toString())
      : await uploadPostImage(file.buffer, post._id.toString());

    const newMedia = {
      type: isAudio ? "audio" as const : "image" as const,
      url: isAudio
        ? uploadedMedia.secure_url
        : getOptimizedPostImageUrl(uploadedMedia.public_id, uploadedMedia.version),
      publicId: uploadedMedia.public_id,
    };

    try {
      post.media = newMedia;
      await post.save();
    } catch (error) {
      await deleteCloudinaryPostMedia(newMedia.publicId, newMedia.type);
      throw error;
    }

    if (oldPublicId) {
      try {
        await deleteCloudinaryPostMedia(oldPublicId, oldMediaType);
      } catch (error) {
        console.error(
          "Failed to delete old post media from Cloudinary:",
          error
        );
      }
    }
  } else {
    await post.save();
  }

  return {
    id: post._id,
    author: post.author,
    content: post.content,
    media: post.media,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
};

const deletePost = async (userId: string, postId: string) => {
  if (!mongoose.isValidObjectId(postId)) {
    throw new AppError(400, "INVALID_POST_ID", "Invalid post ID");
  }

  const post = await Post.findById(postId)
    .select("_id author media hashtags")
    .lean();

  if (!post) {
    throw new AppError(404, "POST_NOT_FOUND", "Post not found");
  }

  if (post.author.toString() !== userId) {
    throw new AppError(403, "FORBIDDEN", "You can only delete your own post");
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Delete related hashtag counts
    if (post.hashtags?.length) {
      await Hashtag.updateMany(
        {
          _id: {
            $in: post.hashtags,
          },
          postsCount: {
            $gt: 0,
          },
        },
        {
          $inc: {
            postsCount: -1,
          },
        },
        { session }
      );
    }

    // Delete related data
    await Like.deleteMany({ post: postId }, { session });

    await Comment.deleteMany({ post: postId }, { session });

    await Notification.deleteMany({ post: postId }, { session });

    await Bookmark.deleteMany({ post: postId }, { session });

    await Repost.deleteMany({ post: postId }, { session });

    // Delete the post itself
    await Post.deleteOne({ _id: postId }, { session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }

  // Cloudinary is external to MongoDB transaction.
  // Delete it only after DB transaction successfully commits.
  if (post.media?.publicId) {
    try {
      await deleteCloudinaryPostMedia(post.media.publicId, post.media.type);
    } catch (error) {
      // DB deletion is already committed.
      // Do not rollback DB data because Cloudinary deletion failed.
      console.error("Failed to delete post media from Cloudinary:", error);
    }
  }

  return {
    message: "Post deleted successfully",
  };
};

const searchPosts = async (
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

  const dbQuery: mongoose.QueryFilter<IPost> = {
    content: searchRegex,
  };

  if (cursor) {
    dbQuery._id = {
      $lt: new mongoose.Types.ObjectId(cursor),
    };
  }

  const posts = await Post.find(dbQuery)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .populate({
      path: "author",
      select: "_id username displayName bio profileImage",
      match: { status: "active" },
    })
    .populate({
      path: "hashtags",
      select : "_id name",
    })
    .lean();

  const hasNextPage = posts.length > limit;

  if (hasNextPage) {
    posts.pop();
  }

  const data = posts.filter((post) => post.author);

  const nextCursor =
    hasNextPage && posts.length > 0
      ? posts[posts.length - 1]._id.toString()
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
  createPost,
  getPostById,
  getUserPosts,
  updatePost,
  deletePost,
  searchPosts,
};
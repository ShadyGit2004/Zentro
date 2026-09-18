import mongoose from "mongoose";

import Bookmark, { IBookmark } from "../models/bookmark.model";
import Post from "../models/post.model";
import User from "../models/user.model";

import AppError from "../utils/appError";

const bookmarkPost = async (userId: string, postId: string) => {
  if (!mongoose.isValidObjectId(postId)) {
    throw new AppError(400, "INVALID_POST_ID", "Invalid post ID");
  }

  const user = await User.findOne({
    _id: userId,
    status: "active",
  })
    .select("_id")
    .lean();

  if (!user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }

  const post = await Post.findById(postId).select("_id").lean();

  if (!post) {
    throw new AppError(404, "POST_NOT_FOUND", "Post not found");
  }

  const existingBookmark = await Bookmark.findOne({
    user: userId,
    post: postId,
  })
    .select("_id")
    .lean();

  if (existingBookmark) {
    throw new AppError(409, "ALREADY_BOOKMARKED", "Post is already bookmarked");
  }

  const bookmark = await Bookmark.create({
    user: userId,
    post: postId,
  });

  return {
    id: bookmark._id,
    postId: bookmark.post,
    createdAt: bookmark.createdAt,
  };
};

const unbookmarkPost = async (userId: string, postId: string) => {
  if (!mongoose.isValidObjectId(postId)) {
    throw new AppError(400, "INVALID_POST_ID", "Invalid post ID");
  }

  const user = await User.findOne({
    _id: userId,
    status: "active",
  })
    .select("_id")
    .lean();

  if (!user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }

  const post = await Post.findById(postId).select("_id").lean();

  if (!post) {
    throw new AppError(404, "POST_NOT_FOUND", "Post not found");
  }

  const bookmark = await Bookmark.findOneAndDelete({
    user: userId,
    post: postId,
  });

  if (!bookmark) {
    throw new AppError(404, "BOOKMARK_NOT_FOUND", "Post is not bookmarked");
  }

  return {
    message: "Post removed from bookmarks",
  };
};

const getBookmarkedPosts = async (
  userId: string,
  limit: number,
  cursor?: string
) => {
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
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }

  
const currentUserId = new mongoose.Types.ObjectId(userId);

  const query: mongoose.QueryFilter<IBookmark> = {
    user: currentUserId,
  };

  if (cursor) {
    query._id = {
      $lt: new mongoose.Types.ObjectId(cursor),
    };
  }


const bookmarks = await Bookmark.aggregate([
  // 1. User ke bookmarks filter karo
  {
    $match: query,
  },

  // 2. Latest bookmarks first
  {
    $sort: {
      _id: -1,
    },
  },

  // 3. limit + 1 for cursor pagination
  {
    $limit: limit + 1,
  },

  // 4. Bookmark -> Post
  {
    $lookup: {
      from: "posts",
      localField: "post",
      foreignField: "_id",
      as: "post",
    },
  },

  // 5. Array to object
  {
    $unwind: "$post",
  },

  // 6. Post's author fetch
  {
    $lookup: {
      from: "users",
      localField: "post.author",
      foreignField: "_id",
      as: "author",
    },
  },

  {
    $unwind: "$author",
  },

  // 7. Inactive author's posts remove
  {
    $match: {
      "author.status": "active",
    },
  },

  // 8. Check current user liked post or not
  {
    $lookup: {
      from: "likes",
      let: {
        postId: "$post._id",
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                {
                  $eq: ["$post", "$$postId"],
                },
                {
                  $eq: ["$user", currentUserId],
                },
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

  // 9. isLiked boolean
  {
    $addFields: {
      "post.isLiked": {
        $gt: [{ $size: "$userLike" }, 0],
      },
      "post.isBookmarked": true,
    },
  },

  // 10. Temporary lookup remove
  {
    $project: {
      userLike: 0,
      user: 0,
    },
  },

  // 11. Final response shape
  {
    $project: {
      _id: "$post._id",
      content: "$post.content",
      media: "$post.media",
      likesCount: "$post.likesCount",
      commentsCount: "$post.commentsCount",
      isLiked: "$post.isLiked",
      isBookmarked: "$post.isBookmarked",
      createdAt: "$post.createdAt",
      updatedAt: "$post.updatedAt",

      author: {
        _id: "$author._id",
        username: "$author.username",
        displayName: "$author.displayName",
        bio: "$author.bio",
        profileImage: "$author.profileImage",
      },
    },
  },
]);

  // const bookmarks = await Bookmark.find(query)
  //   .sort({ _id: -1 })
  //   .limit(limit + 1)
  //   .populate({
  //     path: "post",
  //     populate: {
  //       path: "author",
  //       select: "_id username displayName bio profileImage",
  //       match: {
  //         status: "active",
  //       },
  //     },
  //   })
  //   .lean();

  const hasNextPage = bookmarks.length > limit;

  if (hasNextPage) {
    bookmarks.pop();
  }

  // const data = bookmarks
  //   .filter((bookmark) => bookmark.post)
  //   .map((bookmark) => ({
  //     ...bookmark.post,
  //     isBookmarked: true,
  //   }));

  const nextCursor =
    hasNextPage && bookmarks.length > 0
      ? bookmarks[bookmarks.length - 1]._id.toString()
      : null;

  return {
    data: bookmarks,
    pagination: {
      nextCursor,
      hasNextPage,
    },
  };
};

export { bookmarkPost, unbookmarkPost, getBookmarkedPosts };

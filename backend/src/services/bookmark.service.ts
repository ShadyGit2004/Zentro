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

  const query: mongoose.QueryFilter<IBookmark> = {
    user: new mongoose.Types.ObjectId(userId),
  };

  if (cursor) {
    query._id = {
      $lt: new mongoose.Types.ObjectId(cursor),
    };
  }

  const bookmarks = await Bookmark.find(query)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .populate({
      path: "post",
      populate: {
        path: "author",
        select: "_id username displayName bio profileImage",
        match: {
          status: "active",
        },
      },
    })
    .lean();

  const hasNextPage = bookmarks.length > limit;

  if (hasNextPage) {
    bookmarks.pop();
  }

  const data = bookmarks
    .filter((bookmark) => bookmark.post)
    .map((bookmark) => ({
      ...bookmark.post,
      isBookmarked: true,
    }));

  const nextCursor =
    hasNextPage && bookmarks.length > 0
      ? bookmarks[bookmarks.length - 1]._id.toString()
      : null;

  return {
    data,
    pagination: {
      nextCursor,
      hasNextPage,
    },
  };
};

export { bookmarkPost, unbookmarkPost, getBookmarkedPosts };

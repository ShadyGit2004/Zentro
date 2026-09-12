import mongoose from "mongoose";
import Post, {IPost} from "../models/post.model";
import User from "../models/user.model";
import AppError from "../utils/appError";

const createPost = async (
  userId: string,
  content: string
) => {
  const user = await User.findOne({
    _id: userId,
    status: "active",
  })
    .select("_id")
    .lean();

  if (!user) {
    throw new AppError(
      401,
      "UNAUTHORIZED",
      "Authentication required"
    );
  }

  const post = await Post.create({
    author: userId,
    content,
  });

  return {
    id: post._id,
    author: userId,
    content: post.content,
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

const updatePost = async (
  userId: string,
  postId: string,
  content: string
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

  post.content = content;
  await post.save();

  return {
    id: post._id,
    author: post.author,
    content: post.content,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
};

const deletePost = async (
  userId: string,
  postId: string
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
      "You are not allowed to delete this post"
    );
  }

  await Post.deleteOne({ _id: postId });

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
  updatePost,
  deletePost,
  searchPosts
};
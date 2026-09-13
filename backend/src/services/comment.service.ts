import mongoose from "mongoose";

import Comment from "../models/comment.model";
import Post from "../models/post.model";
import User from "../models/user.model";
import Notification from "../models/notification.model";
import AppError from "../utils/appError";

import { createNotification } from "./notification.service";

const createComment = async (
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

  const post = await Post.findById(postId)
    .select("_id author")
    .lean();

  if (!post) {
    throw new AppError(
      404,
      "POST_NOT_FOUND",
      "Post not found"
    );
  }

  const comment = await Comment.create({
    post: postId,
    author: userId,
    content,
  });

  await createNotification({
    recipient: post.author.toString(),
    actor: userId,
    type: "comment",
    post: postId,
    comment: comment._id.toString(),
  });

  await Post.updateOne(
    { _id: postId },
    { $inc: { commentsCount: 1 } }
  );

  const populatedComment = await Comment.findById(
    comment._id
  )
    .populate({
      path: "author",
      select: "_id username displayName profileImage",
      match: { status: "active" },
    })
    .lean();

  return populatedComment;
};

const getComments = async (
  postId: string,
  limit: number,
  cursor?: string
) => {
  if (!mongoose.isValidObjectId(postId)) {
    throw new AppError(
      400,
      "INVALID_POST_ID",
      "Invalid post ID"
    );
  }

  const post = await Post.findById(postId)
    .select("_id")
    .lean();

  if (!post) {
    throw new AppError(
      404,
      "POST_NOT_FOUND",
      "Post not found"
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
    post: string;
    _id?: {
      $lt: mongoose.Types.ObjectId;
    };
  } = {
    post: postId,
  };

  if (cursor) {
    query._id = {
      $lt: new mongoose.Types.ObjectId(cursor),
    };
  }

  const comments = await Comment.find(query)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .populate({
      path: "author",
      select: "_id username displayName profileImage",
      match: { status: "active" },
    })
    .lean();

  const hasNextPage = comments.length > limit;

  if (hasNextPage) {
    comments.pop();
  }

  const data = comments.filter(
    (comment) => comment.author
  );

  const nextCursor =
    hasNextPage && comments.length > 0
      ? comments[comments.length - 1]._id.toString()
      : null;

  return {
    data,
    pagination: {
      nextCursor,
      hasNextPage,
    },
  };
};

const deleteComment = async (
  userId: string,
  postId: string,
  commentId: string
) => {
  if (!mongoose.isValidObjectId(postId)) {
    throw new AppError(400, "INVALID_POST_ID", "Invalid post ID");
  }

  if (!mongoose.isValidObjectId(commentId)) {
    throw new AppError(400, "INVALID_COMMENT_ID", "Invalid comment ID");
  }

  const post = await Post.findById(postId).select("_id").lean();

  if (!post) {
    throw new AppError(404, "POST_NOT_FOUND", "Post not found");
  }

  const comment = await Comment.findOne({
    _id: commentId,
    post: postId,
  }).lean();

  if (!comment) {
    throw new AppError(404, "COMMENT_NOT_FOUND", "Comment not found");
  }

  if (comment.author.toString() !== userId) {
    throw new AppError(
      403,
      "FORBIDDEN",
      "You can only delete your own comment"
    );
  }
  
  await Notification.deleteMany({ comment: commentId });

  await Comment.deleteOne({ _id: commentId });

  await Post.updateOne(
    { _id: postId },
    { $inc: { commentsCount: -1 } }
  );

  return {
    message: "Comment deleted successfully",
  };
};

export {
  createComment,
  getComments,
  deleteComment,
};
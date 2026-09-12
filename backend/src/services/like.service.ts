import mongoose from "mongoose";

// Modles
import Like from "../models/like.model";
import Post from "../models/post.model";
import User from "../models/user.model";
import AppError from "../utils/appError";

import { createNotification } from "./notification.service";

const likePost = async (
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

  const user = await User.findOne({
    _id: userId,
    status: "active",
  }).select("_id")
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

  const existingLike = await Like.findOne({
    user: userId,
    post: postId,
  })
    .select("_id")
    .lean();

  if (existingLike) {
    throw new AppError(
      409,
      "ALREADY_LIKED",
      "You have already liked this post"
    );
  }

  try {
    await Like.create({
      user: userId,
      post: postId,
    });

    await createNotification({
      recipient: post.author.toString(),
      actor: userId,
      type: "like",
      post: postId,
    });

    await Post.updateOne(
      { _id: postId },
      { $inc: { likesCount: 1 } }
    );
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      throw new AppError(
        409,
        "ALREADY_LIKED",
        "You have already liked this post"
      );
    }

    throw error;
  }

  return {
    message: "Post liked successfully",
  };
};

const unlikePost = async (
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

  const deletedLike = await Like.findOneAndDelete({
    user: userId,
    post: postId,
  });

  await Post.updateOne(
    { _id: postId },
    { $inc: { likesCount: -1 } }
  );

  if (!deletedLike) {
    throw new AppError(
      404,
      "NOT_LIKED",
      "You have not liked this post"
    );
  }

  return {
    message: "Post unliked successfully",
  };
};

export {
  likePost,
  unlikePost,
};
import mongoose from "mongoose";

import Repost from "../models/repost.model";
import Post from "../models/post.model";
import User from "../models/user.model";
import Notification from "../models/notification.model";

import AppError from "../utils/appError";
import { createNotification } from "./notification.service";

const repostPost = async (userId: string, postId: string) => {
  if (!mongoose.isValidObjectId(postId)) {
    throw new AppError(400, "INVALID_POST_ID", "Invalid post ID");
  }

  const user = await User.findOne({
    _id: userId,
    status: "active",
  })
    .select("_id")
    .lean();

  if (!user || user.status !== "active") {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }

  const post = await Post.findById(postId).select("_id author").lean();

  if (!post) {
    throw new AppError(404, "POST_NOT_FOUND", "Post not found");
  }

  const existingRepost = await Repost.findOne({
    user: userId,
    post: postId,
  })
    .select("_id")
    .lean();

  if (existingRepost) {
    throw new AppError(
      409,
      "ALREADY_REPOSTED",
      "You have already reposted this post"
    );
  }

  try {
    await Repost.create({
      user: userId,
      post: postId,
    });

    await Post.updateOne({ _id: postId }, { $inc: { repostsCount: 1 } });

    if (post.author.toString() !== userId) {
      await createNotification({
        recipient: post.author.toString(),
        actor: userId,
        type: "repost",
        post: postId,
      });
    }
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      throw new AppError(
        409,
        "ALREADY_REPOSTED",
        "You have already reposted this post"
      );
    }

    throw error;
  }

  return {
    message: "Post reposted successfully",
  };
};

const unrepostPost = async (userId: string, postId: string) => {
  if (!mongoose.isValidObjectId(postId)) {
    throw new AppError(400, "INVALID_POST_ID", "Invalid post ID");
  }

  const post = await Post.findById(postId).select("_id author").lean();

  if (!post) {
    throw new AppError(404, "POST_NOT_FOUND", "Post not found");
  }

  const deletedRepost = await Repost.findOneAndDelete({
    user: userId,
    post: postId,
  });

  if (!deletedRepost) {
    throw new AppError(404, "NOT_REPOSTED", "You have not reposted this post");
  }

  await Post.updateOne({ _id: postId }, { $inc: { repostsCount: -1 } });

  if (post.author.toString() !== userId) {
    await Notification.findOneAndDelete({
      recipient: post.author.toString(),
      actor: userId,
      type: "repost",
      post: postId,
    });
  }

  return {
    message: "Post unreposted successfully",
  };
};

export { repostPost, unrepostPost };

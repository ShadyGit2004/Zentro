import mongoose from "mongoose";
import Post, {IPost} from "../models/post.model";
import User from "../models/user.model";
import Like from "../models/like.model";
import Comment from "../models/comment.model";
import Notification from "../models/notification.model";
import AppError from "../utils/appError";
import { uploadPostImage, deletePostImage } from "./cloudinary.service";

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
    throw new AppError(
      401,
      "UNAUTHORIZED",
      "Authentication required"
    );
  }

  if (!content && !file) {
    throw new AppError(
      400,
      "EMPTY_POST",
      "Post must contain text or an image"
    );
  }

  const post = await Post.create({
    author: userId,
    content,
  });

  if (file) {
    let uploadedPublicId: string | undefined;

    try {
      const uploadedImage = await uploadPostImage(
        file.buffer,
        post._id.toString()
      );

      uploadedPublicId = uploadedImage.public_id;

      post.media = {
        url: uploadedImage.secure_url,
        publicId: uploadedImage.public_id,
      };

      await post.save();
    } catch (error) {
      await Post.deleteOne({ _id: post._id });

      if (uploadedPublicId) {
        await deletePostImage(uploadedPublicId);
      }

      throw error;
    }
  }

  return {
    id: post._id,
    author: userId,
    content: post.content,
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
      "Provide content or image to update"
    );
  }

  const oldPublicId = post.media?.publicId;

  if (content !== undefined) {
    post.content = content;
  }

  if (file) {
    const uploadedImage = await uploadPostImage(
      file.buffer,
      post._id.toString()
    );

    const newMedia = {
      url: uploadedImage.secure_url,
      publicId: uploadedImage.public_id,
    };

    try {
      post.media = newMedia;

      await post.save();
    } catch (error) {
      await deletePostImage(newMedia.publicId);
      throw error;
    }

    if (oldPublicId) {
      await deletePostImage(oldPublicId);
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

  const post = await Post.findById(postId).select("_id author media").lean();

  if (!post) {
    throw new AppError(404, "POST_NOT_FOUND", "Post not found");
  }

  if (post.author.toString() !== userId) {
    throw new AppError(403, "FORBIDDEN", "You can only delete your own post");
  }

  // Delete related data
  await Like.deleteMany({ post: postId });
  await Comment.deleteMany({ post: postId });
  await Notification.deleteMany({ post: postId });

  // Delete media from Cloudinary if present
  if (post.media?.publicId) {
    await deletePostImage(post.media.publicId);
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
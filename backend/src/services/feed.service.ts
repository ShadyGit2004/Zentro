import mongoose from "mongoose";
import Post from "../models/post.model";
import Follow from "../models/follow.model";
import AppError from "../utils/appError";

const getFeed = async (
  userId: string,
  limit: number,
  cursor?: string
) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError(400, "INVALID_USER_ID", "Invalid user ID");
  }

  const following = await Follow.find({
    follower: userId,
  })
    .select("following")
    .lean();

  const authorIds = [
    new mongoose.Types.ObjectId(userId),
    ...following.map((follow) => follow.following),
  ];

  if (cursor && !mongoose.isValidObjectId(cursor)) {
    throw new AppError(400, "INVALID_CURSOR", "Invalid cursor");
  }

  const query: {
    author: { $in: mongoose.Types.ObjectId[] };
    _id?: { $lt: mongoose.Types.ObjectId };
  } = {
    author: { $in: authorIds },
  };

  if (cursor) {
    query._id = {
      $lt: new mongoose.Types.ObjectId(cursor),
    };
  }

  const posts = await Post.find(query)
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

export default getFeed;
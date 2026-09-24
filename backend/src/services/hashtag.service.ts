import mongoose from "mongoose";
import Post from "../models/post.model";
import Hashtag from "../models/hashtag.model";
import AppError from "../utils/appError";

const getHashtagPosts = async (
  hashtagName: string,
  userId: string,
  limit: number,
  cursor?: string
) => {
  const name = hashtagName.trim().toLowerCase();

  const hashtag = await Hashtag.findOne({
    name,
  })
    .select("_id name postsCount")
    .lean();

  if (!hashtag) {
    throw new AppError(404, "HASHTAG_NOT_FOUND", "Hashtag not found");
  }

  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError(400, "INVALID_USER_ID", "Invalid user id");
  }

  if (cursor && !mongoose.isValidObjectId(cursor)) {
    throw new AppError(400, "INVALID_CURSOR", "Invalid cursor");
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);

  const matchStage: {
    hashtags: mongoose.Types.ObjectId;
    _id?: {
      $lt: mongoose.Types.ObjectId;
    };
  } = {
    hashtags: hashtag._id,
  };

  if (cursor) {
    matchStage._id = {
      $lt: new mongoose.Types.ObjectId(cursor),
    };
  }

  const posts = await Post.aggregate([
    {
      $match: matchStage,
    },

    {
      $sort: {
        _id: -1,
      },
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
      $limit: limit + 1,
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
                  {
                    $eq: ["$post", "$$postId"],
                  },
                  {
                    $eq: ["$user", userObjectId],
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
                  {
                    $eq: ["$post", "$$postId"],
                  },
                  {
                    $eq: ["$user", userObjectId],
                  },
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
                $and: [
                  {
                    $eq: ["$post", "$$postId"],
                  },
                  {
                    $eq: ["$user", userObjectId],
                  },
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
          bio: "$author.bio",
          profileImage: "$author.profileImage",
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

        likesCount: 1,
        commentsCount: 1,
        repostsCount: 1,

        isLiked: {
          $gt: [
            {
              $size: "$userLike",
            },
            0,
          ],
        },

        isBookmarked: {
          $gt: [
            {
              $size: "$userBookmark",
            },
            0,
          ],
        },

        isReposted: {
          $gt: [
            {
              $size: "$userRepost",
            },
            0,
          ],
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
    hashtag,
    data: posts,
    pagination: {
      nextCursor,
      hasNextPage,
    },
  };
};

const searchHashtags = async (query: string, limit: number) => {
  const search = query.trim().toLowerCase();
  const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const hashtags = await Hashtag.find({
    name: {
      $regex: `^${escapedSearch}`,
      $options: "i",
    },
    postsCount: {
      $gt: 0,
    },
  })
    .select("_id name postsCount")
    .sort({
      postsCount: -1,
      name: 1,
    })
    .limit(limit)
    .lean();

  return hashtags;
};

export { getHashtagPosts, searchHashtags };

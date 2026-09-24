import Hashtag from "../models/hashtag.model";
import Post from "../models/post.model";

const getTrendingHashtags = async (limit: number) => {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const trendingHashtags = await Post.aggregate([
    {
      $match: {
        createdAt: {
          $gte: since,
        },
        hashtags: {
          $exists: true,
          $ne: [],
        },
      },
    },

    {
      $unwind: "$hashtags",
    },

    {
      $group: {
        _id: "$hashtags",
        recentPostsCount: {
          $sum: 1,
        },
      },
    },

    {
      $sort: {
        recentPostsCount: -1,
        _id: 1,
      },
    },

    {
      $limit: limit,
    },

    {
      $lookup: {
        from: "hashtags",
        localField: "_id",
        foreignField: "_id",
        as: "hashtag",
      },
    },

    {
      $unwind: "$hashtag",
    },

    {
      $project: {
        _id: "$hashtag._id",
        name: "$hashtag.name",
        postsCount: "$hashtag.postsCount",
        recentPostsCount: 1,
      },
    },
  ]);

  return trendingHashtags;
};

export { getTrendingHashtags };

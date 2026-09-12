import mongoose from "mongoose";
import Post from "../models/post.model";
import Follow from "../models/follow.model";
import AppError from "../utils/appError";

type FeedCursor = {
  score: number;
  createdAt: string;
  id: string;
};

const encodeCursor = (cursor: FeedCursor): string => {
  return Buffer.from(JSON.stringify(cursor)).toString("base64url");
};

const decodeCursor = (cursor: string): FeedCursor => {
  try {
    const decoded = JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf-8")
    );

    if (
      typeof decoded.score !== "number" ||
      typeof decoded.createdAt !== "string" ||
      typeof decoded.id !== "string" ||
      !mongoose.isValidObjectId(decoded.id)
    ) {
      throw new Error();
    }

    return decoded;
  } catch {
    throw new AppError(
      400,
      "INVALID_CURSOR",
      "Invalid cursor"
    );
  }
};

const getFeed = async (
  userId: string,
  limit: number,
  cursor?: string
) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError(
      400,
      "INVALID_USER_ID",
      "Invalid user ID"
    );
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

  let decodedCursor: FeedCursor | undefined;

  if (cursor) {
    decodedCursor = decodeCursor(cursor);
  }

  const pipeline: mongoose.PipelineStage[] = [
    {
      $match: {
        author: {
          $in: authorIds,
        },
      },
    },

    {
      $addFields: {
        engagementScore: {
          $add: [
            { $ifNull: ["$likesCount", 0] },
            {
              $multiply: [
                { $ifNull: ["$commentsCount", 0] },
                2,
              ],
            },
          ],
        },
      },
    },

    {
      $addFields: {
        ageInHours: {
          $divide: [
            {
              $subtract: [
                new Date(),
                "$createdAt",
              ],
            },
            1000 * 60 * 60,
          ],
        },
      },
    },

    {
      $addFields: {
        recencyScore: {
          $multiply: [
            20,
            {
              $exp: {
                $multiply: [
                  -1,
                  {
                    $divide: [
                      "$ageInHours",
                      24,
                    ],
                  },
                ],
              },
            },
          ],
        },
      },
    },

    {
      $addFields: {
        score: {
          $add: [
            "$engagementScore",
            "$recencyScore",
          ],
        },
      },
    },

    ...(decodedCursor
      ? [
          {
            $match: {
              $or: [
                {
                  score: {
                    $lt: decodedCursor.score,
                  },
                },
                {
                  score: decodedCursor.score,
                  createdAt: {
                    $lt: new Date(decodedCursor.createdAt),
                  },
                },
                {
                  score: decodedCursor.score,
                  createdAt: new Date(decodedCursor.createdAt),
                  _id: {
                    $lt: new mongoose.Types.ObjectId(
                      decodedCursor.id
                    ),
                  },
                },
              ],
            },
          },
        ]
      : []),

    {
      $sort: {
        score: -1,
        createdAt: -1,
        _id: -1,
      },
    },

    {
      $limit: limit + 1,
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
      $unwind: {
        path: "$author",
        preserveNullAndEmptyArrays: false,
      },
    },

    {
      $match: {
        "author.status": "active",
      },
    },

    {
      $project: {
        _id: 1,
        content: 1,
        media: 1,
        likesCount: 1,
        commentsCount: 1,
        createdAt: 1,
        updatedAt: 1,
        score: 1,

        author: {
          _id: 1,
          username: 1,
          displayName: 1,
          bio: 1,
          profileImage: 1,
        },
      },
    },
  ];

  const posts = await Post.aggregate(pipeline);

  const hasNextPage = posts.length > limit;

  if (hasNextPage) {
    posts.pop();
  }

  const lastPost = posts[posts.length - 1];

  const nextCursor =
    hasNextPage && lastPost
      ? encodeCursor({
          score: lastPost.score,
          createdAt: lastPost.createdAt.toISOString(),
          id: lastPost._id.toString(),
        })
      : null;

  return {
    data: posts,
    pagination: {
      nextCursor,
      hasNextPage,
    },
  };
};

export default getFeed;
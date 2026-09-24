import { Request, Response, NextFunction } from "express";

import { getTrendingHashtags } from "../services/trending.service";
import AppError from "../utils/appError";

const getTrending = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limitValue = Number(req.query.limit);

    const limit = req.query.limit ? Math.min(Math.max(limitValue, 1), 20) : 10;

    if (!Number.isInteger(limit) || limit < 1) {
      throw new AppError(
        400,
        "INVALID_LIMIT",
        "Limit must be a positive integer"
      );
    }

    const trendingHashtags = await getTrendingHashtags(limit);

    res.status(200).json({
      success: true,
      data: trendingHashtags,
    });
  } catch (error) {
    next(error);
  }
};

export { getTrending };

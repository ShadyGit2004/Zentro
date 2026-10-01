import { Request, Response, NextFunction } from "express";

import AppError from "../utils/appError";
import { translationService } from "../services/translation/translation.provider";

const translatePost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { postId } = req.params;

    if (typeof postId !== "string") {
      throw new AppError(400, "INVALID_POST_ID", "Invalid post ID");
    }

    const { targetLanguage } = req.body;

    const result = await translationService.translatePost(
      postId,
      targetLanguage
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const translateComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { postId, commentId } = req.params;

    if (typeof postId !== "string") {
      throw new AppError(400, "INVALID_POST_ID", "Invalid post ID");
    }

    if (typeof commentId !== "string") {
      throw new AppError(400, "INVALID_COMMENT_ID", "Invalid comment ID");
    }

    const { targetLanguage } = req.body;

    const result = await translationService.translateComment(
      postId,
      commentId,
      targetLanguage
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export { translatePost, translateComment };

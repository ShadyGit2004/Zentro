import TranslationCache from "../../models/translation-cache.model";
import Post from "../../models/post.model";
import Comment from "../../models/comment.model";
import AppError from "../../utils/appError";

import {
  SUPPORTED_TRANSLATION_LANGUAGES,
  type TranslationLanguage,
  type TranslationProvider,
} from "./translation.types";

import { createTranslationHash } from "../../utils/translation.utils";


export class TranslationService {
  constructor(private readonly provider: TranslationProvider) {}

  private validateLanguage(
    targetLanguage: string
  ): asserts targetLanguage is TranslationLanguage {
    if (
      !SUPPORTED_TRANSLATION_LANGUAGES.includes(
        targetLanguage as TranslationLanguage
      )
    ) {
      throw new AppError(
        422,
        "UNSUPPORTED_TRANSLATION_LANGUAGE",
        "Unsupported translation language"
      );
    }
  }

  private async translateText(
    text: string,
    targetLanguage: TranslationLanguage
  ): Promise<string> {
    const normalizedText = text.trim();

    if (!normalizedText) {
      throw new AppError(422, "EMPTY_CONTENT", "Content cannot be empty");
    }

    const textHash = createTranslationHash(normalizedText);

    const cachedTranslation = await TranslationCache.findOne({
      textHash,
      targetLanguage,
    })
      .select("translatedText")
      .lean();

    if (cachedTranslation) {
      return cachedTranslation.translatedText;
    }

    const translatedText = await this.provider.translate(
      normalizedText,
      targetLanguage
    );

    const cacheEntry = await TranslationCache.findOneAndUpdate(
      {
        textHash,
        targetLanguage,
      },
      {
        $set: {
          translatedText,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    )
      .select("translatedText")
      .lean();

    return cacheEntry?.translatedText ?? translatedText;
  }

  async translatePost(postId: string, targetLanguage: string) {
    this.validateLanguage(targetLanguage);

    const post = await Post.findById(postId).select("_id content").lean();

    if (!post) {
      throw new AppError(404, "POST_NOT_FOUND", "Post not found");
    }

    if (!post.content?.trim()) {
      throw new AppError(
        422,
        "POST_HAS_NO_TEXT",
        "This post has no text to translate"
      );
    }

    const translatedText = await this.translateText(
      post.content,
      targetLanguage
    );

    return {
      postId: post._id.toString(),
      targetLanguage,
      translatedText,
    };
  }

  async translateComment(
    postId: string,
    commentId: string,
    targetLanguage: string
  ) {
    this.validateLanguage(targetLanguage);

    const comment = await Comment.findOne({
      _id: commentId,
      post: postId,
    })
      .select("_id content")
      .lean();

    if (!comment) {
      throw new AppError(404, "COMMENT_NOT_FOUND", "Comment not found");
    }

    const translatedText = await this.translateText(
      comment.content,
      targetLanguage
    );

    return {
      commentId: comment._id.toString(),
      targetLanguage,
      translatedText,
    };
  }
}
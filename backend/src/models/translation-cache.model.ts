import mongoose, { Document, Schema } from "mongoose";

import type { TranslationLanguage } from "../services/translation/translation.types";

export interface ITranslationCache extends Document {
  textHash: string;
  targetLanguage: TranslationLanguage;
  translatedText: string;
  createdAt: Date;
  updatedAt: Date;
}

const translationCacheSchema = new Schema<ITranslationCache>(
  {
    textHash: {
      type: String,
      required: true,
      trim: true,
    },

    targetLanguage: {
      type: String,
      enum: ["en", "hi", "es", "fr", "ru", "pt", "zh"],
      required: true,
    },

    translatedText: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

translationCacheSchema.index(
  {
    textHash: 1,
    targetLanguage: 1,
  },
  {
    unique: true,
  }
);

const TranslationCache = mongoose.model<ITranslationCache>(
  "TranslationCache",
  translationCacheSchema
);

export default TranslationCache;

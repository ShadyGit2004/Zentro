import AppError from "../../utils/appError";
import { translationConfig } from "../../config/translation";
import type { TranslationProvider } from "./translation.types";
import { GoogleTranslationProvider } from "./google-translation.provider";
import { DeepLTranslationProvider } from "./deepl-translation.provider";
import { TranslationService } from "./translation.service";

let translationProvider: TranslationProvider;

switch (translationConfig.provider) {
  case "deepl":
    translationProvider = new DeepLTranslationProvider();
    break;

  case "google":
    translationProvider = new GoogleTranslationProvider();
    break;

  default:
    throw new AppError(
      500,
      "UNSUPPORTED_TRANSLATION_PROVIDER",
      `Unsupported translation provider: ${translationConfig.provider}`
    );
}

export const translationService = new TranslationService(translationProvider);



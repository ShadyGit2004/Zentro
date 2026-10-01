import AppError from "../../utils/appError";

import type {
  TranslationLanguage,
  TranslationProvider,
} from "./translation.types";

export class GoogleTranslationProvider implements TranslationProvider {
  async translate(
    _text: string,
    _targetLanguage: TranslationLanguage
  ): Promise<string> {
    if (!process.env.TRANSLATION_API_KEY) {
      throw new AppError(
        503,
        "TRANSLATION_SERVICE_UNAVAILABLE",
        "Translation service is currently unavailable"
      );
    }

    throw new AppError(
      501,
      "TRANSLATION_PROVIDER_NOT_IMPLEMENTED",
      "Translation provider is not configured yet"
    );
  }
}

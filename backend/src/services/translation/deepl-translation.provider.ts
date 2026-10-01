import AppError from "../../utils/appError";
import type {
  TranslationLanguage,
  TranslationProvider,
} from "./translation.types";

interface DeepLTranslationResponse {
  translations?: Array<{
    detected_source_language?: string;
    text?: string;
  }>;
}

const DEEPL_LANGUAGE_MAP: Record<TranslationLanguage, string> = {
  en: "EN",
  hi: "HI",
  es: "ES",
  fr: "FR",
  ru: "RU",
  pt: "PT-BR",
  zh: "ZH",
};

export class DeepLTranslationProvider implements TranslationProvider {
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor() {
    const apiKey = process.env.TRANSLATION_API_KEY;

    if (!apiKey) {
      throw new Error("TRANSLATION_API_KEY is not configured");
    }

    this.apiKey = apiKey;
    this.apiUrl =
      process.env.DEEPL_API_URL?.replace(/\/+$/, "") ??
      "https://api-free.deepl.com";
  }

  async translate(
    text: string,
    targetLanguage: TranslationLanguage
  ): Promise<string> {
    const targetLang = DEEPL_LANGUAGE_MAP[targetLanguage];

    if (!targetLang) {
      throw new AppError(
        422,
        "UNSUPPORTED_TRANSLATION_LANGUAGE",
        "Unsupported translation language"
      );
    }

    try {
      const response = await fetch(`${this.apiUrl}/v2/translate`, {
        method: "POST",
        headers: {
          Authorization: `DeepL-Auth-Key ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: [text],
          target_lang: targetLang,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Translation service request failed";

        try {
          const errorBody = (await response.json()) as {
            message?: string;
          };

          if (errorBody.message) {
            errorMessage = errorBody.message;
          }
        } catch {
          // Keep generic error message if response is not JSON.
        }

        if (response.status === 429) {
          throw new AppError(
            429,
            "TRANSLATION_RATE_LIMITED",
            "Translation service rate limit exceeded"
          );
        }

        if (response.status === 401 || response.status === 403) {
          throw new AppError(
            503,
            "TRANSLATION_SERVICE_UNAVAILABLE",
            "Translation service is currently unavailable"
          );
        }

        throw new AppError(502, "TRANSLATION_PROVIDER_ERROR", errorMessage);
      }

      const data = (await response.json()) as DeepLTranslationResponse;

      const translatedText = data.translations?.[0]?.text;

      if (!translatedText) {
        throw new AppError(
          502,
          "INVALID_TRANSLATION_RESPONSE",
          "Translation service returned an invalid response"
        );
      }

      return translatedText;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        503,
        "TRANSLATION_SERVICE_UNAVAILABLE",
        "Translation service is currently unavailable"
      );
    }
  }
}

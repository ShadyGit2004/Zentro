export const SUPPORTED_TRANSLATION_LANGUAGES = [
  "en",
  "hi",
  "es",
  "fr",
  "ru",
  "pt",
  "zh",
] as const;

export type TranslationLanguage =
  (typeof SUPPORTED_TRANSLATION_LANGUAGES)[number];

export interface TranslationProvider {
  translate(text: string, targetLanguage: TranslationLanguage): Promise<string>;
}

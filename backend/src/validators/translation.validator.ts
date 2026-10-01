import { z } from "zod";

export const translateContentSchema = z.object({
  targetLanguage: z.enum(["en", "hi", "es", "fr", "ru", "pt", "zh"]),
});

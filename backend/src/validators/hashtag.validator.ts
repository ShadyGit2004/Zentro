import { z } from "zod";

export const hashtagPostsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),

  cursor: z.string().optional(),
});

export const searchHashtagsSchema = z.object({
  q: z
    .string()
    .trim()
    .min(1, "Search query is required")
    .max(50, "Search query is too long"),

  limit: z.coerce.number().int().min(1).max(20).default(10),
});

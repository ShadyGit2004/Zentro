import { z } from "zod";

export const createPostSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Post content is required")
    .max(280, "Post content must be at most 280 characters"),
});

export const updatePostSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Post content is required")
    .max(280, "Post content must be at most 280 characters"),
});
import { z } from "zod";

export const createPostSchema = z.object({
  content: z
    .string()
    .trim()
    .max(280, "Post content must be at most 280 characters")
    .optional(),
});

export const updatePostSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Post content cannot be empty")
    .max(280, "Post content must be at most 280 characters")
    .optional(),
});

export const searchPostsSchema = z.object({
  q: z
    .string()
    .trim()
    .min(2, "Search query must be at least 2 characters")
    .max(100, "Search query must be at most 100 characters"),
});
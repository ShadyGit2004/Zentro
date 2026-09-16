import { z } from "zod";

export const createPostSchema = z.object({
  content: z
    .string()
    .trim()
    .max(280, "Post cannot exceed 280 characters")
    .optional(),
});

export const updatePostSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Post cannot be empty")
    .max(280, "Post cannot exceed 280 characters"),
});


// export const searchPostsSchema = z.object({
//   q: z
//     .string()
//     .trim()
//     .min(2, "Search query must be at least 2 characters")
//     .max(100, "Search query must be at most 100 characters"),
// });

export type CreatePostFormData = z.infer<typeof createPostSchema>;
export type UpdatePostFormData = z.infer<typeof updatePostSchema>;
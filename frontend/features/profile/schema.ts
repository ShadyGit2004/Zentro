import { z } from "zod";

export const updateProfileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers and underscore"
    ),

  displayName: z
    .string()
    .trim()
    .min(1, "Display name is required")
    .max(50, "Display name cannot exceed 50 characters"),

  bio: z
    .string()
    .trim()
    .max(160, "Bio cannot exceed 160 characters"),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
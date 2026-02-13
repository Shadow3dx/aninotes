import { z } from "zod";

export const postSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens"),
  excerpt: z.string().max(500).optional().or(z.literal("")),
  contentMarkdown: z.string().min(1, "Content is required"),
  coverImage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  animeTitle: z.string().min(1, "Anime title is required").max(200),
  episodeNumber: z.coerce.number().int().min(0, "Episode must be 0 or higher"),
  season: z.string().min(1, "Season is required").max(100),
  rating: z.coerce.number().int().min(1, "Rating must be 1-10").max(10, "Rating must be 1-10"),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED"]),
  publishAt: z.string().datetime().optional().nullable(),
  tagIds: z.array(z.string()).default([]),
  categoryIds: z.array(z.string()).default([]),
});

export type PostInput = z.infer<typeof postSchema>;

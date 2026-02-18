import { z } from "zod";

export const postSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(200),
    slug: z
      .string()
      .min(1, "Slug is required")
      .max(200)
      .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens"),
    excerpt: z.string().max(500).optional().or(z.literal("")),
    contentMarkdown: z.string().min(1, "Content is required"),
    coverImage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    reviewType: z.enum(["ANIME", "MANGA"]).default("ANIME"),
    animeTitle: z.string().max(200).optional().or(z.literal("")),
    episodeNumber: z.preprocess(
      (val) => (val === "" || val === undefined ? null : val),
      z.coerce.number().int().min(0).nullable()
    ),
    season: z.string().max(100).optional().or(z.literal("")),
    mangaTitle: z.string().max(200).optional().or(z.literal("")),
    chapterNumber: z.preprocess(
      (val) => (val === "" || val === undefined ? null : val),
      z.coerce.number().int().min(0).nullable()
    ),
    rating: z.coerce.number().int().min(1, "Rating must be 1-10").max(10, "Rating must be 1-10"),
    status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED"]),
    publishAt: z.string().datetime().optional().nullable(),
    tagIds: z.array(z.string()).default([]),
    categoryIds: z.array(z.string()).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.reviewType === "ANIME") {
      if (!data.animeTitle) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Anime title is required", path: ["animeTitle"] });
      }
      if (!data.season) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Season is required", path: ["season"] });
      }
      if (data.episodeNumber == null) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Episode number is required", path: ["episodeNumber"] });
      }
    }
    if (data.reviewType === "MANGA") {
      if (!data.mangaTitle) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Manga title is required", path: ["mangaTitle"] });
      }
      if (data.chapterNumber == null) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Chapter number is required", path: ["chapterNumber"] });
      }
    }
  });

export type PostInput = z.infer<typeof postSchema>;

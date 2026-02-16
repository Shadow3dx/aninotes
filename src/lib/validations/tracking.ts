import { z } from "zod";

export const animeStatusValues = [
  "WATCHING",
  "COMPLETED",
  "ON_HOLD",
  "DROPPED",
  "PLAN_TO_WATCH",
] as const;

export const mangaStatusValues = [
  "READING",
  "COMPLETED",
  "ON_HOLD",
  "DROPPED",
  "PLAN_TO_READ",
] as const;

export type AnimeStatus = (typeof animeStatusValues)[number];
export type MangaStatus = (typeof mangaStatusValues)[number];

export const animeStatusLabels: Record<AnimeStatus, string> = {
  WATCHING: "Watching",
  COMPLETED: "Completed",
  ON_HOLD: "On Hold",
  DROPPED: "Dropped",
  PLAN_TO_WATCH: "Plan to Watch",
};

export const mangaStatusLabels: Record<MangaStatus, string> = {
  READING: "Reading",
  COMPLETED: "Completed",
  ON_HOLD: "On Hold",
  DROPPED: "Dropped",
  PLAN_TO_READ: "Plan to Read",
};

export const animeEntrySchema = z.object({
  malId: z.coerce.number().int().positive(),
  title: z.string().min(1),
  imageUrl: z.string().optional().default(""),
  synopsis: z.string().optional().default(""),
  totalEpisodes: z.coerce.number().int().min(0).optional().nullable(),
  mediaType: z.string().optional().default(""),
  airingStatus: z.string().optional().default(""),
  malScore: z.coerce.number().min(0).max(10).optional().nullable(),
  status: z.enum(animeStatusValues),
  score: z.coerce.number().int().min(1).max(10).optional().nullable(),
  episodesWatched: z.coerce.number().int().min(0).default(0),
  notes: z.string().max(2000).optional().default(""),
});

export const mangaEntrySchema = z.object({
  malId: z.coerce.number().int().positive(),
  title: z.string().min(1),
  imageUrl: z.string().optional().default(""),
  synopsis: z.string().optional().default(""),
  totalChapters: z.coerce.number().int().min(0).optional().nullable(),
  totalVolumes: z.coerce.number().int().min(0).optional().nullable(),
  mediaType: z.string().optional().default(""),
  publishingStatus: z.string().optional().default(""),
  malScore: z.coerce.number().min(0).max(10).optional().nullable(),
  status: z.enum(mangaStatusValues),
  score: z.coerce.number().int().min(1).max(10).optional().nullable(),
  chaptersRead: z.coerce.number().int().min(0).default(0),
  volumesRead: z.coerce.number().int().min(0).default(0),
  notes: z.string().max(2000).optional().default(""),
});

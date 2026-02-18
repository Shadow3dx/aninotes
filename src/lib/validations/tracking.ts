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

// Preprocess empty strings to null so z.coerce.number() doesn't turn "" into 0
const optionalNumber = z.preprocess(
  (val) => (val === "" || val === undefined ? null : val),
  z.coerce.number().nullable()
);

const optionalScore = z.preprocess(
  (val) => (val === "" || val === undefined ? null : val),
  z.coerce.number().int().min(1).max(10).nullable()
);

export const animeEntrySchema = z.object({
  malId: z.coerce.number().int().positive(),
  title: z.string().min(1),
  imageUrl: z.string().optional().default(""),
  synopsis: z.string().optional().default(""),
  totalEpisodes: optionalNumber.optional(),
  mediaType: z.string().optional().default(""),
  airingStatus: z.string().optional().default(""),
  malScore: optionalNumber.optional(),
  status: z.enum(animeStatusValues),
  score: optionalScore.optional(),
  episodesWatched: z.coerce.number().int().min(0).default(0),
  notes: z.string().max(2000).optional().default(""),
});

export const mangaEntrySchema = z.object({
  malId: z.coerce.number().int().positive(),
  title: z.string().min(1),
  imageUrl: z.string().optional().default(""),
  synopsis: z.string().optional().default(""),
  totalChapters: optionalNumber.optional(),
  totalVolumes: optionalNumber.optional(),
  mediaType: z.string().optional().default(""),
  publishingStatus: z.string().optional().default(""),
  malScore: optionalNumber.optional(),
  status: z.enum(mangaStatusValues),
  score: optionalScore.optional(),
  chaptersRead: z.coerce.number().int().min(0).default(0),
  volumesRead: z.coerce.number().int().min(0).default(0),
  notes: z.string().max(2000).optional().default(""),
});

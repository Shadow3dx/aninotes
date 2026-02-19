import type { AnimeEntry, MangaEntry } from "@prisma/client";
import { prisma } from "@/lib/prisma";

interface Recommendation {
  title: string;
  imageUrl: string | null;
  mediaType: "anime" | "manga";
  reason: string;
  malId: number;
  entry: AnimeEntry | MangaEntry | null;
}

export async function getRecommendations(userId: string): Promise<Recommendation[]> {
  // Get user's highly rated entries (score >= 7)
  const [userAnime, userManga] = await Promise.all([
    prisma.animeEntry.findMany({
      where: { userId, score: { gte: 7 } },
      select: { malId: true, title: true },
    }),
    prisma.mangaEntry.findMany({
      where: { userId, score: { gte: 7 } },
      select: { malId: true, title: true },
    }),
  ]);

  if (userAnime.length === 0 && userManga.length === 0) return [];

  // Get all user's entries (to exclude from recommendations)
  const [allUserAnime, allUserManga] = await Promise.all([
    prisma.animeEntry.findMany({
      where: { userId },
      select: { malId: true },
    }),
    prisma.mangaEntry.findMany({
      where: { userId },
      select: { malId: true },
    }),
  ]);
  const userAnimeIds = new Set(allUserAnime.map((e) => e.malId));
  const userMangaIds = new Set(allUserManga.map((e) => e.malId));

  const recommendations: Recommendation[] = [];

  // Find similar users who also rated these anime highly
  if (userAnime.length > 0) {
    const userAnimeMalIds = userAnime.map((e) => e.malId);
    const similarUsers = await prisma.animeEntry.groupBy({
      by: ["userId"],
      where: {
        malId: { in: userAnimeMalIds },
        score: { gte: 7 },
        userId: { not: userId },
      },
      _count: true,
      having: { userId: { _count: { gte: 2 } } },
    });

    if (similarUsers.length > 0) {
      const similarUserIds = similarUsers.map((u) => u.userId);
      const theirEntries = await prisma.animeEntry.findMany({
        where: {
          userId: { in: similarUserIds },
          score: { gte: 7 },
          malId: { notIn: [...userAnimeIds] },
        },
        select: { malId: true, title: true, imageUrl: true },
      });

      // Count frequency
      const freq = new Map<number, { count: number; title: string; imageUrl: string | null }>();
      for (const e of theirEntries) {
        const existing = freq.get(e.malId);
        if (existing) {
          existing.count++;
        } else {
          freq.set(e.malId, { count: 1, title: e.title, imageUrl: e.imageUrl });
        }
      }

      const sorted = [...freq.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 8);
      // Fetch full representative entries for detail dialog
      const topMalIds = sorted.map(([malId]) => malId);
      const fullEntries = await prisma.animeEntry.findMany({
        where: { malId: { in: topMalIds } },
        distinct: ["malId"],
      });
      const entryMap = new Map(fullEntries.map((e) => [e.malId, e]));
      for (const [malId, data] of sorted) {
        recommendations.push({
          title: data.title,
          imageUrl: data.imageUrl,
          mediaType: "anime",
          reason: `Liked by ${data.count} users with similar taste`,
          malId,
          entry: entryMap.get(malId) ?? null,
        });
      }
    }
  }

  // Same for manga
  if (userManga.length > 0) {
    const userMangaMalIds = userManga.map((e) => e.malId);
    const similarUsers = await prisma.mangaEntry.groupBy({
      by: ["userId"],
      where: {
        malId: { in: userMangaMalIds },
        score: { gte: 7 },
        userId: { not: userId },
      },
      _count: true,
      having: { userId: { _count: { gte: 2 } } },
    });

    if (similarUsers.length > 0) {
      const similarUserIds = similarUsers.map((u) => u.userId);
      const theirEntries = await prisma.mangaEntry.findMany({
        where: {
          userId: { in: similarUserIds },
          score: { gte: 7 },
          malId: { notIn: [...userMangaIds] },
        },
        select: { malId: true, title: true, imageUrl: true },
      });

      const freq = new Map<number, { count: number; title: string; imageUrl: string | null }>();
      for (const e of theirEntries) {
        const existing = freq.get(e.malId);
        if (existing) {
          existing.count++;
        } else {
          freq.set(e.malId, { count: 1, title: e.title, imageUrl: e.imageUrl });
        }
      }

      const sorted = [...freq.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 8);
      // Fetch full representative entries for detail dialog
      const topMalIds = sorted.map(([malId]) => malId);
      const fullEntries = await prisma.mangaEntry.findMany({
        where: { malId: { in: topMalIds } },
        distinct: ["malId"],
      });
      const entryMap = new Map(fullEntries.map((e) => [e.malId, e]));
      for (const [malId, data] of sorted) {
        recommendations.push({
          title: data.title,
          imageUrl: data.imageUrl,
          mediaType: "manga",
          reason: `Liked by ${data.count} users with similar taste`,
          malId,
          entry: entryMap.get(malId) ?? null,
        });
      }
    }
  }

  return recommendations.slice(0, 8);
}

import type { AnimeEntry, MangaEntry } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface Recommendation {
  title: string;
  imageUrl: string | null;
  mediaType: "anime" | "manga";
  reason: string;
  malId: number;
  entry: AnimeEntry | MangaEntry | null;
}

// Fetch full representative entries for the detail dialog
async function fetchFullAnimeEntries(malIds: number[]): Promise<Map<number, AnimeEntry>> {
  if (malIds.length === 0) return new Map();
  const entries = await prisma.animeEntry.findMany({
    where: { malId: { in: malIds } },
    distinct: ["malId"],
  });
  return new Map(entries.map((e) => [e.malId, e]));
}

async function fetchFullMangaEntries(malIds: number[]): Promise<Map<number, MangaEntry>> {
  if (malIds.length === 0) return new Map();
  const entries = await prisma.mangaEntry.findMany({
    where: { malId: { in: malIds } },
    distinct: ["malId"],
  });
  return new Map(entries.map((e) => [e.malId, e]));
}

export async function getRecommendations(userId: string): Promise<Recommendation[]> {
  const TARGET = 8;

  // Get all of user's existing entries (to exclude from all recommendation tiers)
  const [allUserAnime, allUserManga] = await Promise.all([
    prisma.animeEntry.findMany({ where: { userId }, select: { malId: true } }),
    prisma.mangaEntry.findMany({ where: { userId }, select: { malId: true } }),
  ]);
  const userAnimeIds = new Set(allUserAnime.map((e) => e.malId));
  const userMangaIds = new Set(allUserManga.map((e) => e.malId));

  // Track added malIds to avoid duplicates across tiers
  const addedAnime = new Set<number>();
  const addedManga = new Set<number>();

  const recommendations: Recommendation[] = [];

  // ─── TIER 1: Follow network ───────────────────────────────────────────────
  // What people you follow have rated highly (score >= 7) that you haven't seen
  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });
  const followingIds = follows.map((f) => f.followingId);

  if (followingIds.length > 0) {
    const [followedAnime, followedManga] = await Promise.all([
      prisma.animeEntry.findMany({
        where: {
          userId: { in: followingIds },
          score: { gte: 7 },
          malId: { notIn: [...userAnimeIds] },
        },
        select: { malId: true, title: true, imageUrl: true, score: true },
        orderBy: { score: "desc" },
      }),
      prisma.mangaEntry.findMany({
        where: {
          userId: { in: followingIds },
          score: { gte: 7 },
          malId: { notIn: [...userMangaIds] },
        },
        select: { malId: true, title: true, imageUrl: true, score: true },
        orderBy: { score: "desc" },
      }),
    ]);

    // Deduplicate by malId, keeping highest score seen
    const animeMap = new Map<number, { title: string; imageUrl: string | null; score: number }>();
    for (const e of followedAnime) {
      const ex = animeMap.get(e.malId);
      if (!ex || (e.score ?? 0) > ex.score) {
        animeMap.set(e.malId, { title: e.title, imageUrl: e.imageUrl, score: e.score ?? 0 });
      }
    }
    const mangaMap = new Map<number, { title: string; imageUrl: string | null; score: number }>();
    for (const e of followedManga) {
      const ex = mangaMap.get(e.malId);
      if (!ex || (e.score ?? 0) > ex.score) {
        mangaMap.set(e.malId, { title: e.title, imageUrl: e.imageUrl, score: e.score ?? 0 });
      }
    }

    const topAnime = [...animeMap.entries()].sort((a, b) => b[1].score - a[1].score).slice(0, TARGET);
    const topManga = [...mangaMap.entries()].sort((a, b) => b[1].score - a[1].score).slice(0, TARGET);

    const animeFullMap = await fetchFullAnimeEntries(topAnime.map(([id]) => id));
    const mangaFullMap = await fetchFullMangaEntries(topManga.map(([id]) => id));

    for (const [malId, data] of topAnime) {
      if (recommendations.length >= TARGET) break;
      addedAnime.add(malId);
      recommendations.push({
        title: data.title,
        imageUrl: data.imageUrl,
        mediaType: "anime",
        reason: "Highly rated by someone you follow",
        malId,
        entry: animeFullMap.get(malId) ?? null,
      });
    }
    for (const [malId, data] of topManga) {
      if (recommendations.length >= TARGET) break;
      addedManga.add(malId);
      recommendations.push({
        title: data.title,
        imageUrl: data.imageUrl,
        mediaType: "manga",
        reason: "Highly rated by someone you follow",
        malId,
        entry: mangaFullMap.get(malId) ?? null,
      });
    }
  }

  if (recommendations.length >= TARGET) return recommendations.slice(0, TARGET);

  // ─── TIER 2: High MAL score titles tracked on the platform ────────────────
  // Titles with malScore >= 7.5 tracked by anyone else that you haven't seen
  const needed = TARGET - recommendations.length;
  const excludeAnimeIds = new Set([...userAnimeIds, ...addedAnime]);
  const excludeMangaIds = new Set([...userMangaIds, ...addedManga]);

  const [platformAnime, platformManga] = await Promise.all([
    prisma.animeEntry.findMany({
      where: {
        userId: { not: userId },
        malScore: { gte: 7.5 },
        malId: { notIn: [...excludeAnimeIds] },
      },
      select: { malId: true, title: true, imageUrl: true, malScore: true },
      orderBy: { malScore: "desc" },
      distinct: ["malId"],
      take: needed * 2,
    }),
    prisma.mangaEntry.findMany({
      where: {
        userId: { not: userId },
        malScore: { gte: 7.5 },
        malId: { notIn: [...excludeMangaIds] },
      },
      select: { malId: true, title: true, imageUrl: true, malScore: true },
      orderBy: { malScore: "desc" },
      distinct: ["malId"],
      take: needed * 2,
    }),
  ]);

  // Interleave anime and manga so we get a mix
  const tier2: { malId: number; title: string; imageUrl: string | null; malScore: number | null; mediaType: "anime" | "manga" }[] = [];
  const maxLen = Math.max(platformAnime.length, platformManga.length);
  for (let i = 0; i < maxLen && tier2.length < needed * 2; i++) {
    if (i < platformAnime.length) tier2.push({ ...platformAnime[i], mediaType: "anime" });
    if (i < platformManga.length) tier2.push({ ...platformManga[i], mediaType: "manga" });
  }

  const tier2AnimeIds = tier2.filter((e) => e.mediaType === "anime").map((e) => e.malId);
  const tier2MangaIds = tier2.filter((e) => e.mediaType === "manga").map((e) => e.malId);
  const [t2AnimeMap, t2MangaMap] = await Promise.all([
    fetchFullAnimeEntries(tier2AnimeIds),
    fetchFullMangaEntries(tier2MangaIds),
  ]);

  for (const item of tier2) {
    if (recommendations.length >= TARGET) break;
    if (item.mediaType === "anime" && addedAnime.has(item.malId)) continue;
    if (item.mediaType === "manga" && addedManga.has(item.malId)) continue;

    if (item.mediaType === "anime") addedAnime.add(item.malId);
    else addedManga.add(item.malId);

    recommendations.push({
      title: item.title,
      imageUrl: item.imageUrl,
      mediaType: item.mediaType,
      reason: `MAL score ${item.malScore != null ? item.malScore.toFixed(1) : "?"} · tracked on AniNotes`,
      malId: item.malId,
      entry: item.mediaType === "anime" ? (t2AnimeMap.get(item.malId) ?? null) : (t2MangaMap.get(item.malId) ?? null),
    });
  }

  if (recommendations.length >= TARGET) return recommendations.slice(0, TARGET);

  // ─── TIER 3: Collaborative filtering (fallback) ───────────────────────────
  // Users with similar taste (>= 2 shared highly-rated titles)
  const [userHighAnime, userHighManga] = await Promise.all([
    prisma.animeEntry.findMany({ where: { userId, score: { gte: 7 } }, select: { malId: true } }),
    prisma.mangaEntry.findMany({ where: { userId, score: { gte: 7 } }, select: { malId: true } }),
  ]);

  const stillNeeded = TARGET - recommendations.length;
  const excludeAnime2 = new Set([...userAnimeIds, ...addedAnime]);
  const excludeManga2 = new Set([...userMangaIds, ...addedManga]);

  if (userHighAnime.length > 0) {
    const highAnimeMalIds = userHighAnime.map((e) => e.malId);
    const similarUsers = await prisma.animeEntry.groupBy({
      by: ["userId"],
      where: { malId: { in: highAnimeMalIds }, score: { gte: 7 }, userId: { not: userId } },
      _count: true,
      having: { userId: { _count: { gte: 2 } } },
    });

    if (similarUsers.length > 0) {
      const theirEntries = await prisma.animeEntry.findMany({
        where: {
          userId: { in: similarUsers.map((u) => u.userId) },
          score: { gte: 7 },
          malId: { notIn: [...excludeAnime2] },
        },
        select: { malId: true, title: true, imageUrl: true },
      });

      const freq = new Map<number, { count: number; title: string; imageUrl: string | null }>();
      for (const e of theirEntries) {
        const ex = freq.get(e.malId);
        if (ex) ex.count++;
        else freq.set(e.malId, { count: 1, title: e.title, imageUrl: e.imageUrl });
      }

      const sorted = [...freq.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, stillNeeded);
      const fullMap = await fetchFullAnimeEntries(sorted.map(([id]) => id));
      for (const [malId, data] of sorted) {
        if (recommendations.length >= TARGET) break;
        addedAnime.add(malId);
        recommendations.push({
          title: data.title,
          imageUrl: data.imageUrl,
          mediaType: "anime",
          reason: `Liked by ${data.count} users with similar taste`,
          malId,
          entry: fullMap.get(malId) ?? null,
        });
      }
    }
  }

  if (userHighManga.length > 0 && recommendations.length < TARGET) {
    const highMangaMalIds = userHighManga.map((e) => e.malId);
    const similarUsers = await prisma.mangaEntry.groupBy({
      by: ["userId"],
      where: { malId: { in: highMangaMalIds }, score: { gte: 7 }, userId: { not: userId } },
      _count: true,
      having: { userId: { _count: { gte: 2 } } },
    });

    if (similarUsers.length > 0) {
      const theirEntries = await prisma.mangaEntry.findMany({
        where: {
          userId: { in: similarUsers.map((u) => u.userId) },
          score: { gte: 7 },
          malId: { notIn: [...excludeManga2] },
        },
        select: { malId: true, title: true, imageUrl: true },
      });

      const freq = new Map<number, { count: number; title: string; imageUrl: string | null }>();
      for (const e of theirEntries) {
        const ex = freq.get(e.malId);
        if (ex) ex.count++;
        else freq.set(e.malId, { count: 1, title: e.title, imageUrl: e.imageUrl });
      }

      const sorted = [...freq.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, stillNeeded);
      const fullMap = await fetchFullMangaEntries(sorted.map(([id]) => id));
      for (const [malId, data] of sorted) {
        if (recommendations.length >= TARGET) break;
        recommendations.push({
          title: data.title,
          imageUrl: data.imageUrl,
          mediaType: "manga",
          reason: `Liked by ${data.count} users with similar taste`,
          malId,
          entry: fullMap.get(malId) ?? null,
        });
      }
    }
  }

  return recommendations.slice(0, TARGET);
}

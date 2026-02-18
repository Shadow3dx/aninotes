import { prisma } from "@/lib/prisma";
import { Container } from "@/components/layout/container";
import { GlobalStatsCards } from "@/components/stats/global-stats-cards";
import { LeaderboardTable } from "@/components/stats/leaderboard-table";
import { PopularTitles } from "@/components/stats/popular-titles";

export const metadata = {
  title: "Stats & Leaderboard | AniNotes",
};

export default async function StatsPage() {
  // Global stats
  const [
    totalUsers,
    totalAnimeTracked,
    totalMangaTracked,
    totalReviews,
    episodesAgg,
    chaptersAgg,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.animeEntry.count(),
    prisma.mangaEntry.count(),
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.animeEntry.aggregate({ _sum: { episodesWatched: true } }),
    prisma.mangaEntry.aggregate({ _sum: { chaptersRead: true } }),
  ]);

  // Popular anime (most tracked)
  const popularAnimeRaw = await prisma.animeEntry.groupBy({
    by: ["malId", "title", "imageUrl"],
    _count: true,
    orderBy: { _count: { malId: "desc" } },
    take: 10,
  });
  // Fetch a full representative entry for each popular anime
  const popularAnimeMalIds = popularAnimeRaw.map((e) => e.malId);
  const popularAnimeEntries = await prisma.animeEntry.findMany({
    where: { malId: { in: popularAnimeMalIds } },
    distinct: ["malId"],
  });
  const animeEntryMap = new Map(popularAnimeEntries.map((e) => [e.malId, e]));
  const popularAnime = popularAnimeRaw.map((e) => ({
    title: e.title,
    imageUrl: e.imageUrl,
    count: e._count,
    entry: animeEntryMap.get(e.malId) ?? null,
  }));

  // Popular manga (most tracked)
  const popularMangaRaw = await prisma.mangaEntry.groupBy({
    by: ["malId", "title", "imageUrl"],
    _count: true,
    orderBy: { _count: { malId: "desc" } },
    take: 10,
  });
  // Fetch a full representative entry for each popular manga
  const popularMangaMalIds = popularMangaRaw.map((e) => e.malId);
  const popularMangaEntries = await prisma.mangaEntry.findMany({
    where: { malId: { in: popularMangaMalIds } },
    distinct: ["malId"],
  });
  const mangaEntryMap = new Map(popularMangaEntries.map((e) => [e.malId, e]));
  const popularManga = popularMangaRaw.map((e) => ({
    title: e.title,
    imageUrl: e.imageUrl,
    count: e._count,
    entry: mangaEntryMap.get(e.malId) ?? null,
  }));

  // Leaderboard: most entries
  const topByEntries = await prisma.user.findMany({
    select: {
      username: true,
      name: true,
      image: true,
      _count: { select: { animeEntries: true, mangaEntries: true } },
    },
    orderBy: [
      { animeEntries: { _count: "desc" } },
    ],
    take: 10,
  });
  const leaderboardEntries = topByEntries
    .map((u) => ({
      username: u.username,
      name: u.name,
      image: u.image,
      value: u._count.animeEntries + u._count.mangaEntries,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // Leaderboard: most episodes watched
  const topWatchers = await prisma.animeEntry.groupBy({
    by: ["userId"],
    _sum: { episodesWatched: true },
    orderBy: { _sum: { episodesWatched: "desc" } },
    take: 10,
  });
  const watcherUserIds = topWatchers.map((w) => w.userId);
  const watcherUsers = await prisma.user.findMany({
    where: { id: { in: watcherUserIds } },
    select: { id: true, username: true, name: true, image: true },
  });
  const watcherMap = new Map(watcherUsers.map((u) => [u.id, u]));
  const leaderboardEpisodes = topWatchers
    .map((w) => {
      const user = watcherMap.get(w.userId);
      return user
        ? {
            username: user.username,
            name: user.name,
            image: user.image,
            value: w._sum.episodesWatched ?? 0,
          }
        : null;
    })
    .filter(Boolean) as { username: string; name: string; image: string | null; value: number }[];

  // Leaderboard: most reviews written
  const topReviewers = await prisma.post.groupBy({
    by: ["authorId"],
    where: { status: "PUBLISHED" },
    _count: true,
    orderBy: { _count: { authorId: "desc" } },
    take: 10,
  });
  const reviewerUserIds = topReviewers.map((r) => r.authorId);
  const reviewerUsers = await prisma.user.findMany({
    where: { id: { in: reviewerUserIds } },
    select: { id: true, username: true, name: true, image: true },
  });
  const reviewerMap = new Map(reviewerUsers.map((u) => [u.id, u]));
  const leaderboardReviews = topReviewers
    .map((r) => {
      const user = reviewerMap.get(r.authorId);
      return user
        ? {
            username: user.username,
            name: user.name,
            image: user.image,
            value: r._count,
          }
        : null;
    })
    .filter(Boolean) as { username: string; name: string; image: string | null; value: number }[];

  return (
    <Container className="py-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Community Stats</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Global statistics and leaderboards across AniNotes
          </p>
        </div>

        {/* Global Stats */}
        <GlobalStatsCards
          totalUsers={totalUsers}
          totalAnimeTracked={totalAnimeTracked}
          totalMangaTracked={totalMangaTracked}
          totalReviews={totalReviews}
          totalEpisodesWatched={episodesAgg._sum.episodesWatched ?? 0}
          totalChaptersRead={chaptersAgg._sum.chaptersRead ?? 0}
        />

        {/* Popular Titles */}
        <div className="grid gap-6 lg:grid-cols-2">
          <PopularTitles title="Most Popular Anime" mediaType="anime" entries={JSON.parse(JSON.stringify(popularAnime))} />
          <PopularTitles title="Most Popular Manga" mediaType="manga" entries={JSON.parse(JSON.stringify(popularManga))} />
        </div>

        {/* Leaderboards */}
        <div className="grid gap-6 lg:grid-cols-3">
          <LeaderboardTable
            title="Most Entries"
            entries={leaderboardEntries}
            valueLabel="entries"
          />
          <LeaderboardTable
            title="Most Episodes Watched"
            entries={leaderboardEpisodes}
            valueLabel="eps"
          />
          <LeaderboardTable
            title="Most Reviews Written"
            entries={leaderboardReviews}
            valueLabel="reviews"
          />
        </div>
      </div>
    </Container>
  );
}

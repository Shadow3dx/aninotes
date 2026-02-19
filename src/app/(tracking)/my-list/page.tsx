import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/layout/container";
import { TrackingDashboard } from "@/components/tracking/tracking-dashboard";
import { HistoryLog } from "@/components/tracking/history-log";
import { RecommendationsSection } from "@/components/tracking/recommendations-section";
import { getRecommendations } from "@/lib/recommendations";
import type { TrackingStats } from "@/types";

export const metadata = { title: "My List | AniNotes" };

export default async function MyListPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [animeEntries, mangaEntries, entryHistory] = await Promise.all([
    prisma.animeEntry.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.mangaEntry.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.entryHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const scoredAnime = animeEntries.filter((e) => e.score !== null);
  const animeStats: TrackingStats = {
    total: animeEntries.length,
    watching: animeEntries.filter((e) => e.status === "WATCHING").length,
    completed: animeEntries.filter((e) => e.status === "COMPLETED").length,
    onHold: animeEntries.filter((e) => e.status === "ON_HOLD").length,
    dropped: animeEntries.filter((e) => e.status === "DROPPED").length,
    planTo: animeEntries.filter((e) => e.status === "PLAN_TO_WATCH").length,
    avgScore:
      scoredAnime.length > 0
        ? scoredAnime.reduce((sum, e) => sum + (e.score ?? 0), 0) /
          scoredAnime.length
        : null,
    totalProgress: animeEntries.reduce(
      (sum, e) => sum + e.episodesWatched,
      0
    ),
  };

  const scoredManga = mangaEntries.filter((e) => e.score !== null);
  const mangaStats: TrackingStats = {
    total: mangaEntries.length,
    watching: mangaEntries.filter((e) => e.status === "READING").length,
    completed: mangaEntries.filter((e) => e.status === "COMPLETED").length,
    onHold: mangaEntries.filter((e) => e.status === "ON_HOLD").length,
    dropped: mangaEntries.filter((e) => e.status === "DROPPED").length,
    planTo: mangaEntries.filter((e) => e.status === "PLAN_TO_READ").length,
    avgScore:
      scoredManga.length > 0
        ? scoredManga.reduce((sum, e) => sum + (e.score ?? 0), 0) /
          scoredManga.length
        : null,
    totalProgress: mangaEntries.reduce(
      (sum, e) => sum + e.chaptersRead,
      0
    ),
  };

  const recommendations = await getRecommendations(session.user.id);

  return (
    <Container className="py-8">
      <TrackingDashboard
        animeEntries={JSON.parse(JSON.stringify(animeEntries))}
        mangaEntries={JSON.parse(JSON.stringify(mangaEntries))}
        animeStats={animeStats}
        mangaStats={mangaStats}
      />
      <HistoryLog
        entries={entryHistory.map((h) => ({
          id: h.id,
          entryType: h.entryType,
          entryTitle: h.entryTitle,
          field: h.field,
          oldValue: h.oldValue,
          newValue: h.newValue,
          createdAt: h.createdAt.toISOString(),
        }))}
      />
      <RecommendationsSection recommendations={JSON.parse(JSON.stringify(recommendations))} />
    </Container>
  );
}

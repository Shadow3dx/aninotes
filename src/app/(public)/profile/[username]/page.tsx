import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Calendar, User as UserIcon, Star, Film, BookOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/layout/container";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileEntryCard } from "@/components/tracking/profile-entry-card";
import { TrackingStatsBar } from "@/components/tracking/tracking-stats-bar";
import { formatDate } from "@/lib/utils";
import type { TrackingStats } from "@/types";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

async function getUser(username: string) {
  return prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      bio: true,
      createdAt: true,
    },
  });
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const user = await getUser(username);
  if (!user) return { title: "User Not Found" };
  return {
    title: `${user.name} (@${user.username})`,
    description: user.bio || `${user.name}'s anime and manga list on AniNotes`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const user = await getUser(username);
  if (!user) notFound();

  const [animeEntries, mangaEntries] = await Promise.all([
    prisma.animeEntry.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.mangaEntry.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
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

  return (
    <Container className="py-8">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-start">
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
            <UserIcon className="h-10 w-10 text-primary" />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
            {user.bio && (
              <p className="mt-2 text-sm text-muted-foreground">{user.bio}</p>
            )}
            <div className="mt-2 flex items-center justify-center gap-4 text-xs text-muted-foreground sm:justify-start">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Joined {formatDate(user.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Film className="h-3 w-3" />
                {animeEntries.length} anime
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {mangaEntries.length} manga
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Anime/Manga Lists */}
      <Tabs defaultValue="anime">
        <TabsList className="mb-6">
          <TabsTrigger value="anime">
            Anime ({animeEntries.length})
          </TabsTrigger>
          <TabsTrigger value="manga">
            Manga ({mangaEntries.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="anime" className="space-y-6">
          <TrackingStatsBar stats={animeStats} type="anime" />
          {animeEntries.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {animeEntries.map((entry) => (
                <ProfileEntryCard
                  key={entry.id}
                  entry={JSON.parse(JSON.stringify(entry))}
                  type="anime"
                />
              ))}
            </div>
          ) : (
            <p className="py-12 text-center text-muted-foreground">
              No anime in this list yet.
            </p>
          )}
        </TabsContent>

        <TabsContent value="manga" className="space-y-6">
          <TrackingStatsBar stats={mangaStats} type="manga" />
          {mangaEntries.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mangaEntries.map((entry) => (
                <ProfileEntryCard
                  key={entry.id}
                  entry={JSON.parse(JSON.stringify(entry))}
                  type="manga"
                />
              ))}
            </div>
          ) : (
            <p className="py-12 text-center text-muted-foreground">
              No manga in this list yet.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </Container>
  );
}

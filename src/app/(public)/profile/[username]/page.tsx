import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Calendar, User as UserIcon, Film, BookOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Container } from "@/components/layout/container";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrackingStatsBar } from "@/components/tracking/tracking-stats-bar";
import { ProfileEntryGrid } from "@/components/tracking/profile-entry-grid";
import { ScoreDistributionChart } from "@/components/tracking/score-distribution-chart";
import { ProfileFavorites } from "@/components/tracking/profile-favorites";
import { ProfileStatsOverview } from "@/components/tracking/profile-stats-overview";
import { ProfileActivityTimeline } from "@/components/tracking/profile-activity-timeline";
import { HistoryLog } from "@/components/tracking/history-log";
import { ProfileCommentSection } from "@/components/profile-comments/profile-comment-section";
import { SendMessageButton } from "@/components/messages/send-message-button";
import { FollowButton } from "@/components/profile/follow-button";
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

  const [animeEntries, mangaEntries, followerCount, followingCount, entryHistory] = await Promise.all([
    prisma.animeEntry.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.mangaEntry.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.follow.count({ where: { followingId: user.id } }),
    prisma.follow.count({ where: { followerId: user.id } }),
    prisma.entryHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
  ]);

  // Compute anime stats
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
        ? scoredAnime.reduce((sum, e) => sum + (e.score ?? 0), 0) / scoredAnime.length
        : null,
    totalProgress: animeEntries.reduce((sum, e) => sum + e.episodesWatched, 0),
  };

  // Compute manga stats
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
        ? scoredManga.reduce((sum, e) => sum + (e.score ?? 0), 0) / scoredManga.length
        : null,
    totalProgress: mangaEntries.reduce((sum, e) => sum + e.chaptersRead, 0),
  };

  // Aggregate stats
  const totalEpisodesWatched = animeEntries.reduce((sum, e) => sum + e.episodesWatched, 0);
  const totalChaptersRead = mangaEntries.reduce((sum, e) => sum + e.chaptersRead, 0);
  const totalVolumesRead = mangaEntries.reduce((sum, e) => sum + e.volumesRead, 0);
  const allScored = [...scoredAnime, ...scoredManga];
  const avgScore =
    allScored.length > 0
      ? allScored.reduce((sum, e) => sum + (e.score ?? 0), 0) / allScored.length
      : null;

  // Favorites
  const animeFavorites = animeEntries.filter((e) => e.isFavorite);
  const mangaFavorites = mangaEntries.filter((e) => e.isFavorite);
  const favoriteItems = [
    ...animeFavorites.map((e) => ({ entry: e, mediaKind: "anime" as const })),
    ...mangaFavorites.map((e) => ({ entry: e, mediaKind: "manga" as const })),
  ];

  // Recent activity (merge, sort by updatedAt, take 8)
  const recentActivity = [
    ...animeEntries.map((e) => ({
      id: e.id,
      title: e.title,
      imageUrl: e.imageUrl,
      status: e.status,
      score: e.score,
      updatedAt: e.updatedAt.toISOString(),
      mediaKind: "anime" as const,
    })),
    ...mangaEntries.map((e) => ({
      id: e.id,
      title: e.title,
      imageUrl: e.imageUrl,
      status: e.status,
      score: e.score,
      updatedAt: e.updatedAt.toISOString(),
      mediaKind: "manga" as const,
    })),
  ]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 8);

  // Fetch session and profile comments
  const session = await auth();
  const isLoggedIn = !!session?.user?.id;
  const isProfileOwner = session?.user?.id === user.id;

  const isFollowing = isLoggedIn && !isProfileOwner
    ? !!(await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: session!.user!.id!,
            followingId: user.id,
          },
        },
      }))
    : false;

  const rawProfileComments = await prisma.profileComment.findMany({
    where: { profileId: user.id },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { name: true, username: true, image: true } } },
  });

  // Build comment tree
  interface CommentNode {
    id: string;
    body: string;
    userName: string;
    username: string;
    createdAt: string;
    isAuthor: boolean;
    replies: CommentNode[];
  }

  function buildCommentTree(parentId: string | null): CommentNode[] {
    return rawProfileComments
      .filter((c) => c.parentId === parentId)
      .map((c) => ({
        id: c.id,
        body: c.body,
        userName: c.user.name,
        userImage: c.user.image,
        username: c.user.username,
        createdAt: c.createdAt.toISOString(),
        isAuthor: c.userId === session?.user?.id,
        replies: buildCommentTree(c.id),
      }));
  }
  const profileComments = buildCommentTree(null);

  // Serialize entries for client components
  const serializedAnime = JSON.parse(JSON.stringify(animeEntries));
  const serializedManga = JSON.parse(JSON.stringify(mangaEntries));
  const serializedFavorites = JSON.parse(JSON.stringify(favoriteItems));

  return (
    <Container className="py-8">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-start">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="h-20 w-20 flex-shrink-0 rounded-full object-cover border"
            />
          ) : (
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
              <UserIcon className="h-10 w-10 text-primary" />
            </div>
          )}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
              </div>
              {isLoggedIn && !isProfileOwner && (
                <div className="flex items-center gap-2">
                  <FollowButton targetUserId={user.id} initialFollowing={isFollowing} />
                  <SendMessageButton recipientId={user.id} />
                </div>
              )}
            </div>
            {user.bio && (
              <p className="mt-2 text-sm text-muted-foreground">{user.bio}</p>
            )}
            <div className="mt-2 flex items-center justify-center gap-4 text-xs text-muted-foreground sm:justify-start">
              <span className="font-medium text-foreground">{followerCount} <span className="font-normal text-muted-foreground">followers</span></span>
              <span className="font-medium text-foreground">{followingCount} <span className="font-normal text-muted-foreground">following</span></span>
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

      {/* Stats Overview */}
      <ProfileStatsOverview
        totalEntries={animeEntries.length + mangaEntries.length}
        totalEpisodesWatched={totalEpisodesWatched}
        totalChaptersRead={totalChaptersRead}
        totalVolumesRead={totalVolumesRead}
        avgScore={avgScore}
      />

      {/* Favorites */}
      <ProfileFavorites items={serializedFavorites} />

      {/* Recent Activity */}
      <ProfileActivityTimeline entries={recentActivity} />

      {/* History Log */}
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

      {/* Profile Comments */}
      <ProfileCommentSection
        profileId={user.id}
        comments={profileComments}
        isLoggedIn={isLoggedIn}
        isProfileOwner={isProfileOwner}
      />

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
          <ScoreDistributionChart scores={animeEntries.map((e) => e.score)} />
          <ProfileEntryGrid entries={serializedAnime} type="anime" />
        </TabsContent>

        <TabsContent value="manga" className="space-y-6">
          <TrackingStatsBar stats={mangaStats} type="manga" />
          <ScoreDistributionChart scores={mangaEntries.map((e) => e.score)} />
          <ProfileEntryGrid entries={serializedManga} type="manga" />
        </TabsContent>
      </Tabs>
    </Container>
  );
}

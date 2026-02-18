import { Users, Film, BookOpen, FileText, Eye, BookMarked } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface GlobalStatsCardsProps {
  totalUsers: number;
  totalAnimeTracked: number;
  totalMangaTracked: number;
  totalReviews: number;
  totalEpisodesWatched: number;
  totalChaptersRead: number;
}

const statConfig = [
  { key: "totalUsers", label: "Users", icon: Users },
  { key: "totalAnimeTracked", label: "Anime Tracked", icon: Film },
  { key: "totalMangaTracked", label: "Manga Tracked", icon: BookOpen },
  { key: "totalReviews", label: "Reviews Published", icon: FileText },
  { key: "totalEpisodesWatched", label: "Episodes Watched", icon: Eye },
  { key: "totalChaptersRead", label: "Chapters Read", icon: BookMarked },
] as const;

export function GlobalStatsCards(props: GlobalStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {statConfig.map(({ key, label, icon: Icon }) => (
        <Card key={key}>
          <CardContent className="flex flex-col items-center p-4 text-center">
            <Icon className="mb-2 h-5 w-5 text-primary" />
            <p className="text-2xl font-bold">{props[key].toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

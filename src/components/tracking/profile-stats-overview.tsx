import { Film, Clock, BookOpen, Library, Star, Hash } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ProfileStatsOverviewProps {
  totalEntries: number;
  totalEpisodesWatched: number;
  totalChaptersRead: number;
  totalVolumesRead: number;
  avgScore: number | null;
}

export function ProfileStatsOverview({
  totalEntries,
  totalEpisodesWatched,
  totalChaptersRead,
  totalVolumesRead,
  avgScore,
}: ProfileStatsOverviewProps) {
  const daysWatched = totalEpisodesWatched > 0
    ? (totalEpisodesWatched * 24) / 1440
    : 0;

  const stats = [
    { label: "Total Entries", value: totalEntries, icon: Hash, color: "text-foreground" },
    { label: "Episodes", value: totalEpisodesWatched.toLocaleString(), icon: Film, color: "text-blue-500" },
    { label: "Days Watched", value: daysWatched.toFixed(1), icon: Clock, color: "text-purple-500" },
    { label: "Chapters", value: totalChaptersRead.toLocaleString(), icon: BookOpen, color: "text-green-500" },
    { label: "Volumes", value: totalVolumesRead.toLocaleString(), icon: Library, color: "text-orange-500" },
    { label: "Avg Score", value: avgScore ? avgScore.toFixed(1) : "—", icon: Star, color: "text-primary" },
  ];

  return (
    <div className="mb-8 grid grid-cols-3 gap-3 md:grid-cols-6">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="flex flex-col items-center p-3 text-center">
            <stat.icon className={`mb-1 h-4 w-4 ${stat.color}`} />
            <span className="text-lg font-bold">{stat.value}</span>
            <span className="text-[11px] text-muted-foreground">{stat.label}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

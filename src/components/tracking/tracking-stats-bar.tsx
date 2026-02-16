import { Card, CardContent } from "@/components/ui/card";
import { Eye, CheckCircle2, Pause, XCircle, Clock, Star, Film } from "lucide-react";
import type { TrackingStats } from "@/types";

interface TrackingStatsBarProps {
  stats: TrackingStats;
  type: "anime" | "manga";
}

const statConfig = {
  anime: {
    activeLabel: "Watching",
    activeIcon: Eye,
    planLabel: "Plan to Watch",
    progressLabel: "Episodes",
  },
  manga: {
    activeLabel: "Reading",
    activeIcon: Eye,
    planLabel: "Plan to Read",
    progressLabel: "Chapters",
  },
};

export function TrackingStatsBar({ stats, type }: TrackingStatsBarProps) {
  const config = statConfig[type];

  const items = [
    { label: "Total", value: stats.total, icon: Film, color: "text-foreground" },
    { label: config.activeLabel, value: stats.watching, icon: config.activeIcon, color: "text-green-500" },
    { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-blue-500" },
    { label: "On Hold", value: stats.onHold, icon: Pause, color: "text-yellow-500" },
    { label: "Dropped", value: stats.dropped, icon: XCircle, color: "text-red-500" },
    { label: config.planLabel, value: stats.planTo, icon: Clock, color: "text-muted-foreground" },
    { label: "Avg Score", value: stats.avgScore?.toFixed(1) ?? "\u2014", icon: Star, color: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="flex flex-col items-center p-3">
            <item.icon className={`mb-1 h-4 w-4 ${item.color}`} />
            <span className="text-lg font-bold">{item.value}</span>
            <span className="text-[11px] text-muted-foreground">
              {item.label}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

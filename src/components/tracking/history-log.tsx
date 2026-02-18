"use client";

import { Film, BookOpen, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HistoryEntry {
  id: string;
  entryType: string;
  entryTitle: string;
  field: string;
  oldValue: number;
  newValue: number;
  createdAt: string;
}

interface HistoryLogProps {
  entries: HistoryEntry[];
}

function formatField(field: string): string {
  switch (field) {
    case "episodesWatched":
      return "episodes";
    case "chaptersRead":
      return "chapters";
    case "volumesRead":
      return "volumes";
    default:
      return field;
  }
}

function formatTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function HistoryLog({ entries }: HistoryLogProps) {
  if (entries.length === 0) return null;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start gap-3 rounded-lg border border-border/30 p-3"
            >
              <div className="mt-0.5 flex-shrink-0">
                {entry.entryType === "ANIME" ? (
                  <Film className="h-4 w-4 text-primary" />
                ) : (
                  <BookOpen className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium">{entry.entryTitle}</span>
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  {formatField(entry.field)}{" "}
                  <span className="font-medium">{entry.oldValue}</span>
                  <ArrowRight className="h-3 w-3" />
                  <span className="font-medium text-primary">{entry.newValue}</span>
                </p>
              </div>
              <span className="flex-shrink-0 text-xs text-muted-foreground">
                {formatTime(entry.createdAt)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

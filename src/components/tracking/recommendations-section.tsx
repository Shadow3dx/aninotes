"use client";

import { useState } from "react";
import { Film, BookOpen, Sparkles } from "lucide-react";
import type { AnimeEntry, MangaEntry } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EntryDetailDialog } from "./entry-detail-dialog";

interface RecommendationItem {
  title: string;
  imageUrl: string | null;
  mediaType: "anime" | "manga";
  reason: string;
  malId: number;
  entry: AnimeEntry | MangaEntry | null;
}

interface RecommendationsSectionProps {
  recommendations: RecommendationItem[];
}

export function RecommendationsSection({ recommendations }: RecommendationsSectionProps) {
  const [selected, setSelected] = useState<RecommendationItem | null>(null);

  if (recommendations.length === 0) return null;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          Recommended for You
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {recommendations.map((rec) => (
            <button
              key={`${rec.mediaType}-${rec.malId}`}
              type="button"
              className="overflow-hidden rounded-lg border border-border/30 bg-card text-left transition-shadow hover:shadow-md cursor-pointer"
              onClick={() => rec.entry && setSelected(rec)}
            >
              {rec.imageUrl ? (
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={rec.imageUrl}
                    alt={rec.title}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              ) : (
                <div className="flex aspect-[3/4] items-center justify-center bg-muted">
                  {rec.mediaType === "anime" ? (
                    <Film className="h-8 w-8 text-muted-foreground" />
                  ) : (
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
              )}
              <div className="p-2">
                <p className="line-clamp-2 text-xs font-medium">{rec.title}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{rec.reason}</p>
              </div>
            </button>
          ))}
        </div>
      </CardContent>

      <EntryDetailDialog
        entry={selected?.entry ?? null}
        type={selected?.mediaType ?? "anime"}
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </Card>
  );
}

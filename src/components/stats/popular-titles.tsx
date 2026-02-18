"use client";

import { useState } from "react";
import { Film, BookOpen, Users } from "lucide-react";
import type { AnimeEntry, MangaEntry } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EntryDetailDialog } from "@/components/tracking/entry-detail-dialog";

interface PopularTitle {
  title: string;
  imageUrl: string | null;
  count: number;
  entry: AnimeEntry | MangaEntry | null;
}

interface PopularTitlesProps {
  title: string;
  mediaType: "anime" | "manga";
  entries: PopularTitle[];
}

export function PopularTitles({ title, mediaType, entries }: PopularTitlesProps) {
  const [selectedEntry, setSelectedEntry] = useState<AnimeEntry | MangaEntry | null>(null);

  if (entries.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {mediaType === "anime" ? (
            <Film className="h-4 w-4 text-primary" />
          ) : (
            <BookOpen className="h-4 w-4 text-primary" />
          )}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {entries.map((entry, i) => (
            <button
              key={`${entry.title}-${i}`}
              type="button"
              className="overflow-hidden rounded-lg border border-border/30 text-left transition-shadow hover:shadow-md cursor-pointer"
              onClick={() => entry.entry && setSelectedEntry(entry.entry)}
            >
              {entry.imageUrl ? (
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={entry.imageUrl}
                    alt={entry.title}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              ) : (
                <div className="flex aspect-[3/4] items-center justify-center bg-muted">
                  {mediaType === "anime" ? (
                    <Film className="h-6 w-6 text-muted-foreground" />
                  ) : (
                    <BookOpen className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
              )}
              <div className="p-2">
                <p className="line-clamp-2 text-xs font-medium">{entry.title}</p>
                <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Users className="h-3 w-3" />
                  {entry.count} users
                </p>
              </div>
            </button>
          ))}
        </div>
      </CardContent>

      <EntryDetailDialog
        entry={selectedEntry}
        type={mediaType}
        open={!!selectedEntry}
        onOpenChange={(open) => {
          if (!open) setSelectedEntry(null);
        }}
      />
    </Card>
  );
}

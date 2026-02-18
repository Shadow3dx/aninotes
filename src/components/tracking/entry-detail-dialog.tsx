"use client";

import type { AnimeEntry, MangaEntry } from "@prisma/client";
import { Film, BookOpen, Star, Tv, Hash, Clock, BarChart3 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "./status-badge";

interface EntryDetailDialogProps {
  entry: AnimeEntry | MangaEntry | null;
  type: "anime" | "manga";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EntryDetailDialog({
  entry,
  type,
  open,
  onOpenChange,
}: EntryDetailDialogProps) {
  if (!entry) return null;

  const isAnime = type === "anime";
  const animeEntry = isAnime ? (entry as AnimeEntry) : null;
  const mangaEntry = !isAnime ? (entry as MangaEntry) : null;

  const progress = isAnime
    ? `${animeEntry!.episodesWatched}${animeEntry!.totalEpisodes ? ` / ${animeEntry!.totalEpisodes}` : ""} episodes`
    : `${mangaEntry!.chaptersRead}${mangaEntry!.totalChapters ? ` / ${mangaEntry!.totalChapters}` : ""} chapters`;

  const volumeInfo = mangaEntry?.volumesRead
    ? `${mangaEntry.volumesRead}${mangaEntry.totalVolumes ? ` / ${mangaEntry.totalVolumes}` : ""} volumes`
    : null;

  const statusText = isAnime ? animeEntry!.airingStatus : mangaEntry!.publishingStatus;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            {isAnime ? <Tv className="h-4 w-4 text-primary" /> : <BookOpen className="h-4 w-4 text-primary" />}
            {entry.title}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
          {/* Cover Image */}
          {entry.imageUrl ? (
            <div className="aspect-[2/3] overflow-hidden rounded-lg">
              <img
                src={entry.imageUrl}
                alt={entry.title}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex aspect-[2/3] items-center justify-center rounded-lg bg-muted">
              {isAnime ? (
                <Film className="h-12 w-12 text-muted-foreground" />
              ) : (
                <BookOpen className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
          )}

          {/* Details */}
          <div className="space-y-3">
            {/* Status & Score badges */}
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={entry.status} />
              {entry.score && (
                <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  <Star className="h-3 w-3" />
                  {entry.score}/10
                </span>
              )}
            </div>

            {/* Info grid */}
            <div className="space-y-2 text-sm">
              {entry.mediaType && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Film className="h-3.5 w-3.5" />
                  <span>Type: <span className="text-foreground">{entry.mediaType}</span></span>
                </div>
              )}

              <div className="flex items-center gap-2 text-muted-foreground">
                <Hash className="h-3.5 w-3.5" />
                <span>Progress: <span className="text-foreground">{progress}</span></span>
              </div>

              {volumeInfo && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>{volumeInfo}</span>
                </div>
              )}

              {statusText && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Status: <span className="text-foreground">{statusText}</span></span>
                </div>
              )}

              {entry.malScore != null && entry.malScore > 0 && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span>MAL Score: <span className="text-foreground">{entry.malScore}</span></span>
                </div>
              )}
            </div>

            {/* Synopsis */}
            {entry.synopsis && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Synopsis
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {entry.synopsis}
                </p>
              </div>
            )}

            {/* Notes */}
            {entry.notes && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Your Notes
                </p>
                <p className="text-sm text-muted-foreground">{entry.notes}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Pencil, Trash2, Star, Heart } from "lucide-react";
import { toast } from "sonner";
import type { AnimeEntry, MangaEntry } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { StatusBadge } from "./status-badge";
import { ProgressBar } from "./progress-bar";
import { EntryEditDialog } from "./entry-edit-dialog";
import { deleteAnimeEntry, deleteMangaEntry, toggleAnimeFavorite, toggleMangaFavorite } from "@/actions/tracking";
import { fadeIn } from "@/lib/motion";

interface EntryCardProps {
  entry: AnimeEntry | MangaEntry;
  type: "anime" | "manga";
}

export function EntryCard({ entry, type }: EntryCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [favoriting, setFavoriting] = useState(false);

  const isAnime = type === "anime";
  const animeEntry = entry as AnimeEntry;
  const mangaEntry = entry as MangaEntry;

  const current = isAnime ? animeEntry.episodesWatched : mangaEntry.chaptersRead;
  const total = isAnime ? animeEntry.totalEpisodes : mangaEntry.totalChapters;
  const progressLabel = isAnime ? "episodes" : "chapters";

  async function handleToggleFavorite() {
    setFavoriting(true);
    try {
      if (isAnime) {
        await toggleAnimeFavorite(entry.id);
      } else {
        await toggleMangaFavorite(entry.id);
      }
      toast.success(entry.isFavorite ? "Removed from favorites" : "Added to favorites");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setFavoriting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      if (isAnime) {
        await deleteAnimeEntry(entry.id);
      } else {
        await deleteMangaEntry(entry.id);
      }
      toast.success("Removed from list");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
      setDeleting(false);
    }
  }

  return (
    <>
      <motion.div variants={fadeIn}>
        <Card className="overflow-hidden transition-shadow hover:shadow-md">
          <div className="flex gap-3 p-3">
            {/* Cover image */}
            <div className="relative h-[120px] w-[85px] flex-shrink-0 overflow-hidden rounded-md bg-muted">
              {entry.imageUrl ? (
                <Image
                  src={entry.imageUrl}
                  alt={entry.title}
                  fill
                  className="object-cover"
                  sizes="85px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  No Image
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex min-w-0 flex-1 flex-col justify-between">
              <div>
                <h3 className="line-clamp-2 text-sm font-semibold leading-tight">
                  {entry.title}
                </h3>
                <div className="mt-1 flex items-center gap-2">
                  <StatusBadge status={entry.status} />
                  {entry.score && (
                    <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 fill-primary text-primary" />
                      {entry.score}/10
                    </span>
                  )}
                </div>
              </div>

              <ProgressBar current={current} total={total} className="mt-2" />
            </div>

            {/* Actions */}
            <div className="flex flex-shrink-0 flex-col gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleToggleFavorite}
                disabled={favoriting}
              >
                <Heart className={cn("h-3.5 w-3.5 transition-colors", entry.isFavorite && "fill-red-500 text-red-500")} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    disabled={deleting}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove from list?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Remove &quot;{entry.title}&quot; from your {type} list?
                      This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </Card>
      </motion.div>

      <EntryEditDialog
        entry={entry}
        type={type}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}

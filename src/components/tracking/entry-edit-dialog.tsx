"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { AnimeEntry, MangaEntry } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  animeStatusLabels,
  mangaStatusLabels,
} from "@/lib/validations/tracking";
import { updateAnimeEntry, updateMangaEntry } from "@/actions/tracking";

interface EntryEditDialogProps {
  entry: AnimeEntry | MangaEntry;
  type: "anime" | "manga";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EntryEditDialog({
  entry,
  type,
  open,
  onOpenChange,
}: EntryEditDialogProps) {
  const [loading, setLoading] = useState(false);
  const isAnime = type === "anime";
  const animeEntry = entry as AnimeEntry;
  const mangaEntry = entry as MangaEntry;

  const statusLabels = isAnime ? animeStatusLabels : mangaStatusLabels;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      if (isAnime) {
        await updateAnimeEntry(entry.id, formData);
      } else {
        await updateMangaEntry(entry.id, formData);
      }
      toast.success("Entry updated");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="line-clamp-1">{entry.title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select name="status" defaultValue={entry.status}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Score (1-10)</Label>
            <Input
              name="score"
              type="number"
              min={1}
              max={10}
              defaultValue={entry.score ?? ""}
              placeholder="Not rated"
            />
          </div>

          {isAnime ? (
            <div className="space-y-2">
              <Label>
                Episodes Watched
                {animeEntry.totalEpisodes
                  ? ` (out of ${animeEntry.totalEpisodes})`
                  : ""}
              </Label>
              <Input
                name="episodesWatched"
                type="number"
                min={0}
                max={animeEntry.totalEpisodes ?? undefined}
                defaultValue={animeEntry.episodesWatched}
              />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label>
                  Chapters Read
                  {mangaEntry.totalChapters
                    ? ` (out of ${mangaEntry.totalChapters})`
                    : ""}
                </Label>
                <Input
                  name="chaptersRead"
                  type="number"
                  min={0}
                  max={mangaEntry.totalChapters ?? undefined}
                  defaultValue={mangaEntry.chaptersRead}
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Volumes Read
                  {mangaEntry.totalVolumes
                    ? ` (out of ${mangaEntry.totalVolumes})`
                    : ""}
                </Label>
                <Input
                  name="volumesRead"
                  type="number"
                  min={0}
                  max={mangaEntry.totalVolumes ?? undefined}
                  defaultValue={mangaEntry.volumesRead}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              name="notes"
              defaultValue={entry.notes ?? ""}
              placeholder="Personal notes..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

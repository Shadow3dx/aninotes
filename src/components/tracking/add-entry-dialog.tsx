"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
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
import type { JikanAnime, JikanManga } from "@/lib/jikan";
import { addAnimeEntry, addMangaEntry } from "@/actions/tracking";

interface AddEntryDialogProps {
  item: JikanAnime | JikanManga | null;
  type: "anime" | "manga";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded?: () => void;
}

export function AddEntryDialog({
  item,
  type,
  open,
  onOpenChange,
  onAdded,
}: AddEntryDialogProps) {
  const [loading, setLoading] = useState(false);
  const isAnime = type === "anime";
  const statusLabels = isAnime ? animeStatusLabels : mangaStatusLabels;
  const defaultStatus = isAnime ? "PLAN_TO_WATCH" : "PLAN_TO_READ";

  if (!item) return null;

  const animeItem = item as JikanAnime;
  const mangaItem = item as JikanManga;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      if (isAnime) {
        await addAnimeEntry(formData);
      } else {
        await addMangaEntry(formData);
      }
      toast.success(`Added "${item!.title}" to your list`);
      onOpenChange(false);
      onAdded?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="line-clamp-2 text-base">
            Add to List
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-3">
          <div className="relative h-[100px] w-[70px] flex-shrink-0 overflow-hidden rounded-md bg-muted">
            {item.images?.jpg?.image_url && (
              <Image
                src={item.images.jpg.image_url}
                alt={item.title}
                fill
                className="object-cover"
                sizes="70px"
              />
            )}
          </div>
          <div>
            <p className="line-clamp-2 text-sm font-semibold">{item.title}</p>
            <p className="text-xs text-muted-foreground">
              {item.type}
              {isAnime && animeItem.episodes
                ? ` \u00B7 ${animeItem.episodes} episodes`
                : ""}
              {!isAnime && mangaItem.chapters
                ? ` \u00B7 ${mangaItem.chapters} chapters`
                : ""}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Hidden metadata fields */}
          <input type="hidden" name="malId" value={item.mal_id} />
          <input type="hidden" name="title" value={item.title} />
          <input
            type="hidden"
            name="imageUrl"
            value={item.images?.jpg?.image_url || ""}
          />
          <input
            type="hidden"
            name="synopsis"
            value={item.synopsis || ""}
          />
          <input
            type="hidden"
            name="mediaType"
            value={item.type || ""}
          />
          <input
            type="hidden"
            name="malScore"
            value={item.score ?? ""}
          />
          {isAnime ? (
            <>
              <input
                type="hidden"
                name="totalEpisodes"
                value={animeItem.episodes ?? ""}
              />
              <input
                type="hidden"
                name="airingStatus"
                value={animeItem.status || ""}
              />
            </>
          ) : (
            <>
              <input
                type="hidden"
                name="totalChapters"
                value={mangaItem.chapters ?? ""}
              />
              <input
                type="hidden"
                name="totalVolumes"
                value={mangaItem.volumes ?? ""}
              />
              <input
                type="hidden"
                name="publishingStatus"
                value={mangaItem.status || ""}
              />
            </>
          )}

          <div className="space-y-2">
            <Label>Status</Label>
            <Select name="status" defaultValue={defaultStatus}>
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
              placeholder="Not rated"
            />
          </div>

          {isAnime ? (
            <div className="space-y-2">
              <Label>Episodes Watched</Label>
              <Input
                name="episodesWatched"
                type="number"
                min={0}
                max={animeItem.episodes ?? undefined}
                defaultValue={0}
              />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Chapters Read</Label>
                <Input
                  name="chaptersRead"
                  type="number"
                  min={0}
                  max={mangaItem.chapters ?? undefined}
                  defaultValue={0}
                />
              </div>
              <div className="space-y-2">
                <Label>Volumes Read</Label>
                <Input
                  name="volumesRead"
                  type="number"
                  min={0}
                  max={mangaItem.volumes ?? undefined}
                  defaultValue={0}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              name="notes"
              placeholder="Personal notes..."
              rows={2}
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
              {loading ? "Adding..." : "Add to List"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

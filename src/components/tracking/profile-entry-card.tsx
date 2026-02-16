"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import type { AnimeEntry, MangaEntry } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import { ProgressBar } from "./progress-bar";
import { fadeIn } from "@/lib/motion";

interface ProfileEntryCardProps {
  entry: AnimeEntry | MangaEntry;
  type: "anime" | "manga";
}

export function ProfileEntryCard({ entry, type }: ProfileEntryCardProps) {
  const isAnime = type === "anime";
  const animeEntry = entry as AnimeEntry;
  const mangaEntry = entry as MangaEntry;

  const current = isAnime ? animeEntry.episodesWatched : mangaEntry.chaptersRead;
  const total = isAnime ? animeEntry.totalEpisodes : mangaEntry.totalChapters;

  return (
    <motion.div variants={fadeIn}>
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className="flex gap-3 p-3">
          <div className="relative h-[100px] w-[70px] flex-shrink-0 overflow-hidden rounded-md bg-muted">
            {entry.imageUrl ? (
              <Image
                src={entry.imageUrl}
                alt={entry.title}
                fill
                className="object-cover"
                sizes="70px"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                No Image
              </div>
            )}
          </div>

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
        </div>
      </Card>
    </motion.div>
  );
}

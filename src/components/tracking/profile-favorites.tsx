"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, Star, Film, BookOpen } from "lucide-react";
import type { AnimeEntry, MangaEntry } from "@prisma/client";
import { staggerContainer, fadeIn } from "@/lib/motion";
import { EntryDetailDialog } from "./entry-detail-dialog";

interface FavoriteItem {
  entry: AnimeEntry | MangaEntry;
  mediaKind: "anime" | "manga";
}

interface ProfileFavoritesProps {
  items: FavoriteItem[];
}

export function ProfileFavorites({ items }: ProfileFavoritesProps) {
  const [selectedEntry, setSelectedEntry] = useState<FavoriteItem | null>(null);

  if (items.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <Heart className="h-5 w-5 fill-red-500 text-red-500" />
        Favorites
      </h2>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
      >
        {items.map(({ entry, mediaKind }) => (
          <motion.div
            key={entry.id}
            variants={fadeIn}
            className="group relative cursor-pointer overflow-hidden rounded-lg border border-border/50 bg-card shadow-sm transition-shadow hover:shadow-md"
            onClick={() => setSelectedEntry({ entry, mediaKind })}
          >
            <div className="relative aspect-[2/3] w-full bg-muted">
              {entry.imageUrl ? (
                <Image
                  src={entry.imageUrl}
                  alt={entry.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  No Image
                </div>
              )}
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              {/* Content overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <h3 className="line-clamp-2 text-xs font-semibold leading-tight text-white">
                  {entry.title}
                </h3>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="flex items-center gap-0.5 text-[10px] text-white/70">
                    {mediaKind === "anime" ? (
                      <Film className="h-2.5 w-2.5" />
                    ) : (
                      <BookOpen className="h-2.5 w-2.5" />
                    )}
                    {mediaKind === "anime" ? "Anime" : "Manga"}
                  </span>
                  {entry.score && (
                    <span className="flex items-center gap-0.5 text-[10px] text-white/70">
                      <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                      {entry.score}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <EntryDetailDialog
        entry={selectedEntry?.entry ?? null}
        type={selectedEntry?.mediaKind ?? "anime"}
        open={!!selectedEntry}
        onOpenChange={(open) => {
          if (!open) setSelectedEntry(null);
        }}
      />
    </div>
  );
}

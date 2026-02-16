"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import type { AnimeEntry, MangaEntry } from "@prisma/client";
import { ProfileEntryCard } from "./profile-entry-card";
import { staggerContainer, fadeIn } from "@/lib/motion";
import { cn } from "@/lib/utils";
import {
  animeStatusValues,
  mangaStatusValues,
  animeStatusLabels,
  mangaStatusLabels,
} from "@/lib/validations/tracking";

const statusColors: Record<string, string> = {
  WATCHING: "bg-green-500/15 text-green-500 border-green-500/30",
  READING: "bg-green-500/15 text-green-500 border-green-500/30",
  COMPLETED: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  ON_HOLD: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
  DROPPED: "bg-red-500/15 text-red-500 border-red-500/30",
  PLAN_TO_WATCH: "bg-muted text-muted-foreground border-border",
  PLAN_TO_READ: "bg-muted text-muted-foreground border-border",
};

interface ProfileEntryGridProps {
  entries: (AnimeEntry | MangaEntry)[];
  type: "anime" | "manga";
}

export function ProfileEntryGrid({ entries, type }: ProfileEntryGridProps) {
  const [activeFilter, setActiveFilter] = useState("all");

  const statusValues = type === "anime" ? animeStatusValues : mangaStatusValues;
  const statusLabelsMap = type === "anime" ? animeStatusLabels : mangaStatusLabels;

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: entries.length };
    for (const status of statusValues) {
      counts[status] = entries.filter((e) => e.status === status).length;
    }
    return counts;
  }, [entries, statusValues]);

  const filtered = useMemo(() => {
    if (activeFilter === "all") return entries;
    return entries.filter((e) => e.status === activeFilter);
  }, [entries, activeFilter]);

  return (
    <div className="space-y-4">
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveFilter("all")}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            activeFilter === "all"
              ? "border-primary/30 bg-primary/15 text-primary"
              : "border-border bg-muted/50 text-muted-foreground hover:text-foreground"
          )}
        >
          All ({statusCounts.all})
        </button>
        {statusValues.map((status) => (
          <button
            key={status}
            onClick={() => setActiveFilter(status)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              activeFilter === status
                ? statusColors[status]
                : "border-border bg-muted/50 text-muted-foreground hover:text-foreground"
            )}
          >
            {statusLabelsMap[status as keyof typeof statusLabelsMap]} ({statusCounts[status] || 0})
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <motion.div
          key={activeFilter}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((entry) => (
            <ProfileEntryCard key={entry.id} entry={entry} type={type} />
          ))}
        </motion.div>
      ) : (
        <motion.p
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="py-8 text-center text-muted-foreground"
        >
          No entries with this status.
        </motion.p>
      )}
    </div>
  );
}

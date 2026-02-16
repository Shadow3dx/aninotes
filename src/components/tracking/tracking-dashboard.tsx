"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import type { AnimeEntry, MangaEntry } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrackingStatsBar } from "./tracking-stats-bar";
import { EntryCard } from "./entry-card";
import { staggerContainer } from "@/lib/motion";
import type { TrackingStats } from "@/types";

interface TrackingDashboardProps {
  animeEntries: AnimeEntry[];
  mangaEntries: MangaEntry[];
  animeStats: TrackingStats;
  mangaStats: TrackingStats;
}

function computeFilteredEntries<T extends { status: string; title: string; score: number | null; updatedAt: Date }>(
  entries: T[],
  statusFilter: string,
  sort: string
) {
  let filtered = entries;
  if (statusFilter !== "all") {
    filtered = filtered.filter((e) => e.status === statusFilter);
  }

  return [...filtered].sort((a, b) => {
    switch (sort) {
      case "title":
        return a.title.localeCompare(b.title);
      case "score":
        return (b.score ?? 0) - (a.score ?? 0);
      case "updated":
      default:
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
  });
}

export function TrackingDashboard({
  animeEntries,
  mangaEntries,
  animeStats,
  mangaStats,
}: TrackingDashboardProps) {
  const [animeStatusFilter, setAnimeStatusFilter] = useState("all");
  const [mangaStatusFilter, setMangaStatusFilter] = useState("all");
  const [animeSort, setAnimeSort] = useState("updated");
  const [mangaSort, setMangaSort] = useState("updated");

  const filteredAnime = useMemo(
    () => computeFilteredEntries(animeEntries, animeStatusFilter, animeSort),
    [animeEntries, animeStatusFilter, animeSort]
  );

  const filteredManga = useMemo(
    () => computeFilteredEntries(mangaEntries, mangaStatusFilter, mangaSort),
    [mangaEntries, mangaStatusFilter, mangaSort]
  );

  const animeStatuses = [
    { value: "all", label: "All" },
    { value: "WATCHING", label: "Watching" },
    { value: "COMPLETED", label: "Completed" },
    { value: "ON_HOLD", label: "On Hold" },
    { value: "DROPPED", label: "Dropped" },
    { value: "PLAN_TO_WATCH", label: "Plan to Watch" },
  ];

  const mangaStatuses = [
    { value: "all", label: "All" },
    { value: "READING", label: "Reading" },
    { value: "COMPLETED", label: "Completed" },
    { value: "ON_HOLD", label: "On Hold" },
    { value: "DROPPED", label: "Dropped" },
    { value: "PLAN_TO_READ", label: "Plan to Read" },
  ];

  const sortOptions = [
    { value: "updated", label: "Last Updated" },
    { value: "title", label: "Title A-Z" },
    { value: "score", label: "Score (High-Low)" },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My List</h1>
        <Link href="/my-list/search">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Entry
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="anime">
        <TabsList className="mb-6">
          <TabsTrigger value="anime">
            Anime ({animeEntries.length})
          </TabsTrigger>
          <TabsTrigger value="manga">
            Manga ({mangaEntries.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="anime" className="space-y-6">
          <TrackingStatsBar stats={animeStats} type="anime" />

          <div className="flex gap-3">
            <Select
              value={animeStatusFilter}
              onValueChange={setAnimeStatusFilter}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                {animeStatuses.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={animeSort} onValueChange={setAnimeSort}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredAnime.length > 0 ? (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filteredAnime.map((entry) => (
                <EntryCard key={entry.id} entry={entry} type="anime" />
              ))}
            </motion.div>
          ) : (
            <div className="py-16 text-center">
              <Search className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-muted-foreground">
                {animeEntries.length === 0
                  ? "Your anime list is empty. Search and add some!"
                  : "No anime match this filter."}
              </p>
              {animeEntries.length === 0 && (
                <Link href="/my-list/search">
                  <Button variant="outline" className="mt-4">
                    Search Anime
                  </Button>
                </Link>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="manga" className="space-y-6">
          <TrackingStatsBar stats={mangaStats} type="manga" />

          <div className="flex gap-3">
            <Select
              value={mangaStatusFilter}
              onValueChange={setMangaStatusFilter}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                {mangaStatuses.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={mangaSort} onValueChange={setMangaSort}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredManga.length > 0 ? (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filteredManga.map((entry) => (
                <EntryCard key={entry.id} entry={entry} type="manga" />
              ))}
            </motion.div>
          ) : (
            <div className="py-16 text-center">
              <Search className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-muted-foreground">
                {mangaEntries.length === 0
                  ? "Your manga list is empty. Search and add some!"
                  : "No manga match this filter."}
              </p>
              {mangaEntries.length === 0 && (
                <Link href="/my-list/search">
                  <Button variant="outline" className="mt-4">
                    Search Manga
                  </Button>
                </Link>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

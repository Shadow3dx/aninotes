"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Search, Star, Plus, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AddEntryDialog } from "./add-entry-dialog";
import { useDebounce } from "@/hooks/use-debounce";
import { fadeIn, staggerContainer } from "@/lib/motion";
import type { JikanAnime, JikanManga } from "@/lib/jikan";

interface JikanSearchPageProps {
  existingAnimeIds: number[];
  existingMangaIds: number[];
}

export function JikanSearchPage({
  existingAnimeIds,
  existingMangaIds,
}: JikanSearchPageProps) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"anime" | "manga">("anime");
  const [results, setResults] = useState<(JikanAnime | JikanManga)[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<
    JikanAnime | JikanManga | null
  >(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

  const debouncedQuery = useDebounce(query, 400);

  const existingIds = tab === "anime" ? existingAnimeIds : existingMangaIds;

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(
      `/api/jikan?q=${encodeURIComponent(debouncedQuery)}&type=${tab}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setResults(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, tab]);

  function handleTabChange(value: string) {
    setTab(value as "anime" | "manga");
    setResults([]);
    setQuery("");
  }

  function handleAdd(item: JikanAnime | JikanManga) {
    setSelectedItem(item);
    setDialogOpen(true);
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Search Anime & Manga</h1>

      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="anime">Anime</TabsTrigger>
          <TabsTrigger value="manga">Manga</TabsTrigger>
        </TabsList>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${tab}...`}
            className="pl-10"
            autoFocus
          />
        </div>

        <TabsContent value="anime">
          <SearchResults
            results={results}
            loading={loading}
            query={debouncedQuery}
            existingIds={existingIds}
            addedIds={addedIds}
            onAdd={handleAdd}
            type="anime"
          />
        </TabsContent>

        <TabsContent value="manga">
          <SearchResults
            results={results}
            loading={loading}
            query={debouncedQuery}
            existingIds={existingIds}
            addedIds={addedIds}
            onAdd={handleAdd}
            type="manga"
          />
        </TabsContent>
      </Tabs>

      <AddEntryDialog
        item={selectedItem}
        type={tab}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAdded={() => {
          if (selectedItem) {
            setAddedIds((prev) => new Set([...prev, selectedItem.mal_id]));
          }
        }}
      />
    </div>
  );
}

function SearchResults({
  results,
  loading,
  query,
  existingIds,
  addedIds,
  onAdd,
  type,
}: {
  results: (JikanAnime | JikanManga)[];
  loading: boolean;
  query: string;
  existingIds: number[];
  addedIds: Set<number>;
  onAdd: (item: JikanAnime | JikanManga) => void;
  type: "anime" | "manga";
}) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="flex gap-3 p-3">
            <Skeleton className="h-[120px] w-[85px] rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!query || query.length < 2) {
    return (
      <div className="py-16 text-center">
        <Search className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
        <p className="text-muted-foreground">
          Type at least 2 characters to search
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">
          No {type} found for &quot;{query}&quot;
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid gap-4 sm:grid-cols-2"
    >
      {results.map((item) => {
        const isInList =
          existingIds.includes(item.mal_id) || addedIds.has(item.mal_id);
        const animeItem = item as JikanAnime;
        const mangaItem = item as JikanManga;

        return (
          <motion.div key={item.mal_id} variants={fadeIn}>
            <Card className="flex gap-3 p-3 transition-shadow hover:shadow-md">
              <div className="relative h-[120px] w-[85px] flex-shrink-0 overflow-hidden rounded-md bg-muted">
                {item.images?.jpg?.image_url && (
                  <Image
                    src={item.images.jpg.image_url}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="85px"
                  />
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                  <h3 className="line-clamp-2 text-sm font-semibold leading-tight">
                    {item.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.type}
                    {type === "anime" && animeItem.episodes
                      ? ` \u00B7 ${animeItem.episodes} ep`
                      : ""}
                    {type === "manga" && mangaItem.chapters
                      ? ` \u00B7 ${mangaItem.chapters} ch`
                      : ""}
                    {item.status ? ` \u00B7 ${item.status}` : ""}
                  </p>
                  {item.score && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3 fill-primary text-primary" />
                      {item.score}
                    </p>
                  )}
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {item.synopsis}
                  </p>
                </div>

                <div className="mt-2">
                  {isInList ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled
                      className="h-7 text-xs"
                    >
                      <Check className="mr-1 h-3 w-3" />
                      In List
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => onAdd(item)}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Add to List
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

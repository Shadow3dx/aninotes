import { RatingDisplay } from "./rating-display";
import { Tv, Hash } from "lucide-react";

interface AnimeMetadataProps {
  animeTitle: string;
  episodeNumber: number;
  season: string;
  rating: number;
  size?: "sm" | "md";
}

export function AnimeMetadata({
  animeTitle,
  episodeNumber,
  season,
  rating,
  size = "sm",
}: AnimeMetadataProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
      <span className="flex items-center gap-1">
        <Tv className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
        <span className={size === "sm" ? "text-xs" : "text-sm"}>{animeTitle}</span>
      </span>
      <span className="text-border">|</span>
      <span className="flex items-center gap-1">
        <Hash className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />
        <span className={size === "sm" ? "text-xs" : "text-sm"}>
          {season} E{episodeNumber}
        </span>
      </span>
      <span className="text-border">|</span>
      <RatingDisplay rating={rating} size={size} />
    </div>
  );
}

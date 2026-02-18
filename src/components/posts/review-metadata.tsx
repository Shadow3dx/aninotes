import { RatingDisplay } from "./rating-display";
import { Tv, BookOpen, Hash } from "lucide-react";

interface ReviewMetadataProps {
  reviewType: string;
  animeTitle?: string | null;
  episodeNumber?: number | null;
  season?: string | null;
  mangaTitle?: string | null;
  chapterNumber?: number | null;
  rating: number;
  size?: "sm" | "md";
}

export function ReviewMetadata({
  reviewType,
  animeTitle,
  episodeNumber,
  season,
  mangaTitle,
  chapterNumber,
  rating,
  size = "sm",
}: ReviewMetadataProps) {
  const iconClass = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  const textClass = size === "sm" ? "text-xs" : "text-sm";

  if (reviewType === "MANGA") {
    return (
      <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
        <span className="flex items-center gap-1">
          <BookOpen className={iconClass} />
          <span className={textClass}>{mangaTitle}</span>
        </span>
        {chapterNumber != null && (
          <>
            <span className="text-border">|</span>
            <span className="flex items-center gap-1">
              <Hash className={iconClass} />
              <span className={textClass}>Ch. {chapterNumber}</span>
            </span>
          </>
        )}
        <span className="text-border">|</span>
        <RatingDisplay rating={rating} size={size} />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
      <span className="flex items-center gap-1">
        <Tv className={iconClass} />
        <span className={textClass}>{animeTitle}</span>
      </span>
      {season && episodeNumber != null && (
        <>
          <span className="text-border">|</span>
          <span className="flex items-center gap-1">
            <Hash className={iconClass} />
            <span className={textClass}>
              {season} E{episodeNumber}
            </span>
          </span>
        </>
      )}
      <span className="text-border">|</span>
      <RatingDisplay rating={rating} size={size} />
    </div>
  );
}

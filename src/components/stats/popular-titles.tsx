import { Film, BookOpen, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PopularTitle {
  title: string;
  imageUrl: string | null;
  count: number;
}

interface PopularTitlesProps {
  title: string;
  mediaType: "anime" | "manga";
  entries: PopularTitle[];
}

export function PopularTitles({ title, mediaType, entries }: PopularTitlesProps) {
  if (entries.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {mediaType === "anime" ? (
            <Film className="h-4 w-4 text-primary" />
          ) : (
            <BookOpen className="h-4 w-4 text-primary" />
          )}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {entries.map((entry, i) => (
            <div key={`${entry.title}-${i}`} className="overflow-hidden rounded-lg border border-border/30">
              {entry.imageUrl ? (
                <div className="aspect-[3/4] overflow-hidden">
                  <img src={entry.imageUrl} alt={entry.title} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex aspect-[3/4] items-center justify-center bg-muted">
                  {mediaType === "anime" ? (
                    <Film className="h-6 w-6 text-muted-foreground" />
                  ) : (
                    <BookOpen className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
              )}
              <div className="p-2">
                <p className="line-clamp-2 text-xs font-medium">{entry.title}</p>
                <p className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Users className="h-3 w-3" />
                  {entry.count} users
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

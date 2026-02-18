"use client";

import { Film, BookOpen, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RecommendationItem {
  title: string;
  imageUrl: string | null;
  mediaType: "anime" | "manga";
  reason: string;
  malId: number;
}

interface RecommendationsSectionProps {
  recommendations: RecommendationItem[];
}

export function RecommendationsSection({ recommendations }: RecommendationsSectionProps) {
  if (recommendations.length === 0) return null;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          Recommended for You
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {recommendations.map((rec) => (
            <div
              key={`${rec.mediaType}-${rec.malId}`}
              className="overflow-hidden rounded-lg border border-border/30 bg-card"
            >
              {rec.imageUrl ? (
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={rec.imageUrl}
                    alt={rec.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex aspect-[3/4] items-center justify-center bg-muted">
                  {rec.mediaType === "anime" ? (
                    <Film className="h-8 w-8 text-muted-foreground" />
                  ) : (
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
              )}
              <div className="p-2">
                <p className="line-clamp-2 text-xs font-medium">{rec.title}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{rec.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

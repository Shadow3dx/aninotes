"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { staggerContainer, fadeIn } from "@/lib/motion";
import { formatRelativeDate } from "@/lib/utils";

interface ActivityEntry {
  id: string;
  title: string;
  imageUrl: string | null;
  status: string;
  score: number | null;
  updatedAt: string;
  mediaKind: "anime" | "manga";
}

function getActivityMessage(entry: ActivityEntry): string {
  const verb = entry.mediaKind === "anime" ? "watching" : "reading";
  switch (entry.status) {
    case "WATCHING":
      return `Started watching ${entry.title}`;
    case "READING":
      return `Started reading ${entry.title}`;
    case "COMPLETED": {
      const rated = entry.score ? ` \u2014 rated ${entry.score}/10` : "";
      return `Completed ${entry.title}${rated}`;
    }
    case "ON_HOLD":
      return `Put ${entry.title} on hold`;
    case "DROPPED":
      return `Dropped ${entry.title}`;
    case "PLAN_TO_WATCH":
      return `Added ${entry.title} to plan to watch`;
    case "PLAN_TO_READ":
      return `Added ${entry.title} to plan to read`;
    default:
      return `Updated ${entry.title}`;
  }
}

interface ProfileActivityTimelineProps {
  entries: ActivityEntry[];
}

export function ProfileActivityTimeline({ entries }: ProfileActivityTimelineProps) {
  if (entries.length === 0) return null;

  return (
    <Card className="mb-8">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-0"
        >
          {entries.map((entry, i) => (
            <motion.div
              key={entry.id}
              variants={fadeIn}
              className="relative flex gap-3 pb-4 last:pb-0"
            >
              {/* Timeline line */}
              {i < entries.length - 1 && (
                <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />
              )}
              {/* Dot + image */}
              <div className="relative flex-shrink-0">
                <div className="h-[30px] w-[30px] overflow-hidden rounded-full border-2 border-background bg-muted shadow-sm">
                  {entry.imageUrl ? (
                    <Image
                      src={entry.imageUrl}
                      alt=""
                      width={30}
                      height={30}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[8px] text-muted-foreground">
                      {entry.mediaKind === "anime" ? "A" : "M"}
                    </div>
                  )}
                </div>
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm leading-snug">
                  {getActivityMessage(entry)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatRelativeDate(entry.updatedAt)}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  );
}

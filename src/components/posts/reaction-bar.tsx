"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ThumbsUp, Heart, Lightbulb, Laugh } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleReaction } from "@/actions/reactions";
import { cn } from "@/lib/utils";

const REACTIONS = [
  { type: "LIKE", icon: ThumbsUp, label: "Like" },
  { type: "LOVE", icon: Heart, label: "Love" },
  { type: "INSIGHTFUL", icon: Lightbulb, label: "Insightful" },
  { type: "FUNNY", icon: Laugh, label: "Funny" },
] as const;

interface ReactionBarProps {
  postId: string;
  initialCounts: Record<string, number>;
  initialUserReactions: string[];
  isLoggedIn: boolean;
}

export function ReactionBar({
  postId,
  initialCounts,
  initialUserReactions,
  isLoggedIn,
}: ReactionBarProps) {
  const [counts, setCounts] = useState(initialCounts);
  const [userReactions, setUserReactions] = useState(initialUserReactions);
  const [loading, setLoading] = useState<string | null>(null);

  async function handleReaction(type: string) {
    if (!isLoggedIn) {
      toast.error("Sign in to react to posts");
      return;
    }
    setLoading(type);
    try {
      const result = await toggleReaction(postId, type as "LIKE" | "LOVE" | "INSIGHTFUL" | "FUNNY");
      setCounts((prev) => ({
        ...prev,
        [type]: (prev[type] ?? 0) + (result.added ? 1 : -1),
      }));
      setUserReactions((prev) =>
        result.added ? [...prev, type] : prev.filter((r) => r !== type)
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {REACTIONS.map(({ type, icon: Icon, label }) => {
        const count = counts[type] ?? 0;
        const active = userReactions.includes(type);

        return (
          <Button
            key={type}
            variant="outline"
            size="sm"
            className={cn(
              "gap-1.5 transition-colors",
              active && "border-primary bg-primary/10 text-primary hover:bg-primary/20"
            )}
            onClick={() => handleReaction(type)}
            disabled={loading === type}
            title={label}
          >
            <Icon className="h-3.5 w-3.5" />
            {count > 0 && <span className="text-xs font-medium">{count}</span>}
          </Button>
        );
      })}
    </div>
  );
}

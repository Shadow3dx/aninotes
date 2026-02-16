"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { staggerContainer, fadeIn } from "@/lib/motion";

interface ScoreDistributionChartProps {
  scores: (number | null)[];
}

export function ScoreDistributionChart({ scores }: ScoreDistributionChartProps) {
  const distribution = useMemo(() => {
    const counts = Array.from({ length: 10 }, () => 0);
    for (const score of scores) {
      if (score !== null && score >= 1 && score <= 10) {
        counts[score - 1]++;
      }
    }
    return counts;
  }, [scores]);

  const maxCount = Math.max(...distribution, 1);
  const hasRatings = distribution.some((c) => c > 0);

  if (!hasRatings) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4" />
            Score Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-4 text-center text-sm text-muted-foreground">
            No ratings yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-4 w-4" />
          Score Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-1.5"
        >
          {Array.from({ length: 10 }, (_, i) => 10 - i).map((score) => {
            const count = distribution[score - 1];
            const width = (count / maxCount) * 100;
            return (
              <motion.div
                key={score}
                variants={fadeIn}
                className="flex items-center gap-2"
              >
                <span className="w-5 text-right text-xs font-medium text-muted-foreground">
                  {score}
                </span>
                <div className="flex-1 overflow-hidden rounded-full bg-muted/50 h-4">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: count > 0 ? `${Math.max(width, 4)}%` : "0%" }}
                  />
                </div>
                <span className="w-6 text-left text-xs text-muted-foreground">
                  {count}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </CardContent>
    </Card>
  );
}

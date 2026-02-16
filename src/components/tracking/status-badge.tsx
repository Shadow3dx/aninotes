import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  WATCHING: "bg-green-500/15 text-green-500 border-green-500/30",
  READING: "bg-green-500/15 text-green-500 border-green-500/30",
  COMPLETED: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  ON_HOLD: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
  DROPPED: "bg-red-500/15 text-red-500 border-red-500/30",
  PLAN_TO_WATCH: "bg-muted text-muted-foreground border-border",
  PLAN_TO_READ: "bg-muted text-muted-foreground border-border",
};

const statusLabels: Record<string, string> = {
  WATCHING: "Watching",
  READING: "Reading",
  COMPLETED: "Completed",
  ON_HOLD: "On Hold",
  DROPPED: "Dropped",
  PLAN_TO_WATCH: "Plan to Watch",
  PLAN_TO_READ: "Plan to Read",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium",
        statusColors[status] || "",
        className
      )}
    >
      {statusLabels[status] || status}
    </Badge>
  );
}

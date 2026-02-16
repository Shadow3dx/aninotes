import { cn } from "@/lib/utils";

interface ProgressBarProps {
  current: number;
  total: number | null;
  className?: string;
}

export function ProgressBar({ current, total, className }: ProgressBarProps) {
  const percentage = total && total > 0 ? Math.min((current / total) * 100, 100) : 0;
  const label = total ? `${current}/${total}` : `${current}/?`;

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Progress</span>
        <span>{label}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

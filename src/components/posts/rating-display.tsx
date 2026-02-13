import { cn } from "@/lib/utils";

interface RatingDisplayProps {
  rating: number;
  size?: "sm" | "md";
}

export function RatingDisplay({ rating, size = "sm" }: RatingDisplayProps) {
  const intensity =
    rating >= 9
      ? "bg-primary text-primary-foreground"
      : rating >= 7
        ? "bg-primary/80 text-primary-foreground"
        : rating >= 5
          ? "bg-primary/50 text-foreground"
          : "bg-muted text-muted-foreground";

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md font-bold",
        intensity,
        size === "sm" ? "h-6 min-w-[2rem] px-1.5 text-xs" : "h-8 min-w-[2.5rem] px-2 text-sm"
      )}
    >
      {rating}/10
    </span>
  );
}

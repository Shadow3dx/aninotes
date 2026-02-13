import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface CategoryBadgeProps {
  name: string;
  slug: string;
}

export function CategoryBadge({ name, slug }: CategoryBadgeProps) {
  return (
    <Link href={`/categories/${slug}`}>
      <Badge
        variant="outline"
        className="cursor-pointer border-primary/30 text-primary transition-colors hover:bg-primary/10"
      >
        {name}
      </Badge>
    </Link>
  );
}

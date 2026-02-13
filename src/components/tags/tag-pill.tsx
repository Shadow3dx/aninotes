import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface TagPillProps {
  name: string;
  slug: string;
  active?: boolean;
}

export function TagPill({ name, slug, active }: TagPillProps) {
  return (
    <Link href={`/tags/${slug}`}>
      <Badge
        variant={active ? "default" : "secondary"}
        className="cursor-pointer transition-colors hover:bg-primary/20 hover:text-primary"
      >
        {name}
      </Badge>
    </Link>
  );
}

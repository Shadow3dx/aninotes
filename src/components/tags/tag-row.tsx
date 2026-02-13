"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Tag } from "@prisma/client";

interface TagRowProps {
  tags: Tag[];
  activeTag?: string;
}

export function TagRow({ tags, activeTag }: TagRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link href="/">
        <Badge
          variant={!activeTag ? "default" : "secondary"}
          className="cursor-pointer transition-colors hover:bg-primary/20 hover:text-primary"
        >
          All
        </Badge>
      </Link>
      {tags.map((tag) => (
        <Link key={tag.id} href={`/?tag=${tag.slug}`}>
          <Badge
            variant={activeTag === tag.slug ? "default" : "secondary"}
            className="cursor-pointer transition-colors hover:bg-primary/20 hover:text-primary"
          >
            {tag.name}
          </Badge>
        </Link>
      ))}
    </div>
  );
}

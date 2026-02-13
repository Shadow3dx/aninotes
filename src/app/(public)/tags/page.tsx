import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Tags",
};

export default async function TagsPage() {
  const tags = await prisma.tag.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <Container className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Browse by <span className="text-primary">Tag</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Filter reviews by genre and category.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {tags.map((tag) => (
          <Link key={tag.id} href={`/tags/${tag.slug}`}>
            <Badge
              variant="secondary"
              className="cursor-pointer px-4 py-2 text-sm transition-colors hover:bg-primary/20 hover:text-primary"
            >
              {tag.name}
              <span className="ml-2 text-muted-foreground">
                ({tag._count.posts})
              </span>
            </Badge>
          </Link>
        ))}
      </div>
    </Container>
  );
}

import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/layout/container";
import { SearchBar } from "@/components/search/search-bar";
import { PostGrid } from "@/components/posts/post-grid";
import type { PostWithRelations } from "@/types";

export const metadata: Metadata = {
  title: "Search",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const q = params.q?.trim();

  let posts: PostWithRelations[] = [];

  if (q) {
    posts = (await prisma.post.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: q } },
          { animeTitle: { contains: q } },
          { excerpt: { contains: q } },
        ],
      },
      include: {
        author: true,
        tags: { include: { tag: true } },
        categories: { include: { category: true } },
      },
      orderBy: { publishedAt: "desc" },
      take: 20,
    })) as PostWithRelations[];
  }

  return (
    <Container className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Search <span className="text-primary">Reviews</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Find reviews by anime title, episode, or keywords.
        </p>
      </div>

      <div className="mb-8 max-w-lg">
        <SearchBar defaultValue={q} />
      </div>

      {q ? (
        <>
          <p className="mb-6 text-sm text-muted-foreground">
            {posts.length} result{posts.length !== 1 ? "s" : ""} for &quot;{q}&quot;
          </p>
          <PostGrid posts={posts} />
        </>
      ) : (
        <div className="py-20 text-center">
          <p className="text-lg text-muted-foreground">
            Start typing to search anime reviews...
          </p>
        </div>
      )}
    </Container>
  );
}

import { prisma } from "@/lib/prisma";
import { Container } from "@/components/layout/container";
import { PostGrid } from "@/components/posts/post-grid";
import { FeaturedPost } from "@/components/posts/featured-post";
import { TagRow } from "@/components/tags/tag-row";
import { Pagination } from "@/components/shared/pagination";
import type { PostWithRelations } from "@/types";

const POSTS_PER_PAGE = 12;

interface HomePageProps {
  searchParams: Promise<{ page?: string; tag?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const activeTag = params.tag;

  // Build where clause
  const where: Record<string, unknown> = {
    OR: [
      { status: "PUBLISHED" },
      {
        status: "SCHEDULED",
        publishAt: { lte: new Date() },
      },
    ],
  };

  if (activeTag) {
    where.tags = {
      some: { tag: { slug: activeTag } },
    };
  }

  const [posts, totalCount, tags] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        author: true,
        tags: { include: { tag: true } },
        categories: { include: { category: true } },
      },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * POSTS_PER_PAGE,
      take: POSTS_PER_PAGE,
    }),
    prisma.post.count({ where }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);
  const featuredPost = page === 1 && !activeTag ? (posts[0] as PostWithRelations | undefined) : undefined;
  const gridPosts = featuredPost ? posts.slice(1) : posts;

  return (
    <Container className="py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Latest <span className="text-primary">Reviews</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          Honest thoughts on every episode watched.
        </p>
      </div>

      {/* Tag filter */}
      <div className="mb-8">
        <TagRow tags={tags} activeTag={activeTag} />
      </div>

      {/* Featured post */}
      {featuredPost && (
        <div className="mb-8">
          <FeaturedPost post={featuredPost as PostWithRelations} />
        </div>
      )}

      {/* Post grid */}
      <PostGrid posts={gridPosts as PostWithRelations[]} />

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        searchParams={activeTag ? { tag: activeTag } : {}}
      />
    </Container>
  );
}

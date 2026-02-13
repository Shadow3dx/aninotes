import { prisma } from "@/lib/prisma";
import { PostCard } from "./post-card";
import type { PostWithRelations } from "@/types";

interface RelatedPostsProps {
  currentPostId: string;
  tagIds: string[];
}

export async function RelatedPosts({
  currentPostId,
  tagIds,
}: RelatedPostsProps) {
  if (tagIds.length === 0) return null;

  const relatedPosts = await prisma.post.findMany({
    where: {
      id: { not: currentPostId },
      status: "PUBLISHED",
      tags: {
        some: { tagId: { in: tagIds } },
      },
    },
    include: {
      author: true,
      tags: { include: { tag: true } },
      categories: { include: { category: true } },
    },
    take: 3,
    orderBy: { publishedAt: "desc" },
  });

  if (relatedPosts.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="mb-6 text-2xl font-bold">Related Reviews</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {relatedPosts.map((post) => (
          <PostCard key={post.id} post={post as PostWithRelations} />
        ))}
      </div>
    </section>
  );
}

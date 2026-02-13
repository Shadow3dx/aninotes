import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/layout/container";
import { PostGrid } from "@/components/posts/post-grid";
import type { PostWithRelations } from "@/types";

interface TagPageProps {
  params: Promise<{ tag: string }>;
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { tag: slug } = await params;
  const tag = await prisma.tag.findUnique({ where: { slug } });
  if (!tag) return { title: "Not Found" };
  return { title: tag.name };
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag: slug } = await params;
  const tag = await prisma.tag.findUnique({ where: { slug } });

  if (!tag) notFound();

  const posts = (await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      tags: { some: { tagId: tag.id } },
    },
    include: {
      author: true,
      tags: { include: { tag: true } },
      categories: { include: { category: true } },
    },
    orderBy: { publishedAt: "desc" },
  })) as PostWithRelations[];

  return (
    <Container className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          <span className="text-primary">{tag.name}</span> Reviews
        </h1>
        <p className="mt-2 text-muted-foreground">
          {posts.length} review{posts.length !== 1 ? "s" : ""} tagged with {tag.name}
        </p>
      </div>

      <PostGrid posts={posts} />
    </Container>
  );
}

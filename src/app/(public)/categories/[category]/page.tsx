import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/layout/container";
import { PostGrid } from "@/components/posts/post-grid";
import type { PostWithRelations } from "@/types";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return { title: "Not Found" };
  return { title: category.name };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });

  if (!category) notFound();

  const posts = (await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      categories: { some: { categoryId: category.id } },
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
          <span className="text-primary">{category.name}</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          {posts.length} review{posts.length !== 1 ? "s" : ""} in {category.name}
        </p>
      </div>

      <PostGrid posts={posts} />
    </Container>
  );
}

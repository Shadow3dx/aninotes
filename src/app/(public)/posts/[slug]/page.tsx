import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Container } from "@/components/layout/container";
import { PostContent } from "@/components/posts/post-content";
import { TableOfContents } from "@/components/posts/table-of-contents";
import { AnimeMetadata } from "@/components/posts/anime-metadata";
import { ShareButton } from "@/components/posts/share-button";
import { RelatedPosts } from "@/components/posts/related-posts";
import { CommentSection } from "@/components/comments/comment-section";
import { TagPill } from "@/components/tags/tag-pill";
import { CategoryBadge } from "@/components/tags/category-badge";
import { Button } from "@/components/ui/button";
import { extractHeadings } from "@/lib/markdown";
import { formatDate, readingTime } from "@/lib/utils";
import type { CommentData } from "@/components/comments/comment-item";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string) {
  return prisma.post.findUnique({
    where: { slug },
    include: {
      author: true,
      tags: { include: { tag: true } },
      categories: { include: { category: true } },
    },
  });
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Not Found" };

  return {
    title: post.title,
    description: post.excerpt ?? `Review of ${post.animeTitle} ${post.season} Episode ${post.episodeNumber}`,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post || (post.status !== "PUBLISHED" && !(post.status === "SCHEDULED" && post.publishAt && post.publishAt <= new Date()))) {
    notFound();
  }

  const headings = extractHeadings(post.contentMarkdown);
  const session = await auth();
  const isAdmin = !!session?.user;

  // Get comments as a nested tree
  const rawComments = await prisma.comment.findMany({
    where: { postId: post.id },
    orderBy: { createdAt: "asc" },
  });

  // Build tree structure
  function buildTree(parentId: string | null): CommentData[] {
    return rawComments
      .filter((c) => c.parentId === parentId)
      .map((c) => ({
        id: c.id,
        body: c.body,
        authorName: c.authorName,
        createdAt: c.createdAt.toISOString(),
        replies: buildTree(c.id),
      }));
  }
  const comments = buildTree(null);

  // Get previous and next posts
  const [prevPost, nextPost] = await Promise.all([
    prisma.post.findFirst({
      where: {
        status: "PUBLISHED",
        publishedAt: post.publishedAt
          ? { lt: post.publishedAt }
          : undefined,
      },
      orderBy: { publishedAt: "desc" },
      select: { slug: true, title: true },
    }),
    prisma.post.findFirst({
      where: {
        status: "PUBLISHED",
        publishedAt: post.publishedAt
          ? { gt: post.publishedAt }
          : undefined,
      },
      orderBy: { publishedAt: "asc" },
      select: { slug: true, title: true },
    }),
  ]);

  return (
    <Container className="py-8">
      <div className="mx-auto max-w-5xl">
        {/* Cover image */}
        {post.coverImage && (
          <div className="relative mb-8 aspect-video overflow-hidden rounded-xl">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_220px]">
          {/* Main content */}
          <article>
            {/* Anime metadata */}
            <AnimeMetadata
              animeTitle={post.animeTitle}
              episodeNumber={post.episodeNumber}
              season={post.season}
              rating={post.rating}
              size="md"
            />

            {/* Title */}
            <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              {post.title}
            </h1>

            {/* Meta row */}
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {post.author.name}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(post.publishedAt ?? post.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {readingTime(post.contentMarkdown)}
              </span>
              <ShareButton />
            </div>

            {/* Tags & Categories */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {post.tags.map(({ tag }) => (
                <TagPill key={tag.id} name={tag.name} slug={tag.slug} />
              ))}
              {post.categories.map(({ category }) => (
                <CategoryBadge
                  key={category.id}
                  name={category.name}
                  slug={category.slug}
                />
              ))}
            </div>

            {/* Markdown content */}
            <div className="mt-8">
              <PostContent content={post.contentMarkdown} />
            </div>

            {/* Previous / Next navigation */}
            <div className="mt-12 grid grid-cols-1 gap-4 border-t border-border/40 pt-8 sm:grid-cols-2">
              {prevPost ? (
                <Link
                  href={`/posts/${prevPost.slug}`}
                  className="group flex items-center gap-2 rounded-lg border border-border/50 p-4 transition-colors hover:border-primary/30"
                >
                  <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Previous</p>
                    <p className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-1">
                      {prevPost.title}
                    </p>
                  </div>
                </Link>
              ) : (
                <div />
              )}
              {nextPost && (
                <Link
                  href={`/posts/${nextPost.slug}`}
                  className="group flex items-center justify-end gap-2 rounded-lg border border-border/50 p-4 text-right transition-colors hover:border-primary/30"
                >
                  <div>
                    <p className="text-xs text-muted-foreground">Next</p>
                    <p className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-1">
                      {nextPost.title}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              )}
            </div>
          </article>

          {/* Sidebar: Table of Contents */}
          <aside className="hidden lg:block">
            <TableOfContents headings={headings} />
          </aside>
        </div>

        {/* Related posts */}
        <RelatedPosts
          currentPostId={post.id}
          tagIds={post.tags.map(({ tag }) => tag.id)}
        />

        {/* Comments */}
        <div className="mt-12 border-t border-border/40 pt-8">
          <CommentSection
            postId={post.id}
            comments={comments}
            isAdmin={isAdmin}
          />
        </div>
      </div>
    </Container>
  );
}

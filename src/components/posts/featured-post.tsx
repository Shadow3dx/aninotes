"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Calendar, Clock } from "lucide-react";
import { fadeInUp } from "@/lib/motion";
import { formatDate, readingTime } from "@/lib/utils";
import { ReviewMetadata } from "./review-metadata";
import { TagPill } from "@/components/tags/tag-pill";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { PostWithRelations } from "@/types";

interface FeaturedPostProps {
  post: PostWithRelations;
}

export function FeaturedPost({ post }: FeaturedPostProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={shouldReduceMotion ? {} : fadeInUp}
      initial="hidden"
      animate="visible"
    >
      <Link href={`/posts/${post.slug}`} className="group block">
        <article className="overflow-hidden rounded-xl border border-border/50 bg-card transition-colors hover:border-primary/30">
          <div className="grid gap-0 md:grid-cols-2">
            {/* Cover Image */}
            {post.coverImage ? (
              <div className="relative aspect-video md:aspect-auto">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center bg-muted md:aspect-auto">
                <span className="text-4xl">🎬</span>
              </div>
            )}

            {/* Content */}
            <div className="flex flex-col justify-center p-6 md:p-8">
              <span className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
                Featured Review
              </span>

              <ReviewMetadata
                reviewType={post.reviewType}
                animeTitle={post.animeTitle}
                episodeNumber={post.episodeNumber}
                season={post.season}
                mangaTitle={post.mangaTitle}
                chapterNumber={post.chapterNumber}
                rating={post.rating}
                size="md"
              />

              <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight group-hover:text-primary transition-colors md:text-3xl">
                {post.title}
              </h2>

              {post.excerpt && (
                <p className="mt-3 line-clamp-3 text-muted-foreground">
                  {post.excerpt}
                </p>
              )}

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {post.tags.map(({ tag }) => (
                    <TagPill key={tag.id} name={tag.name} slug={tag.slug} />
                  ))}
                </div>
              )}

              {/* Meta */}
              <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
                <span
                  role="link"
                  tabIndex={0}
                  className="flex items-center gap-1.5 font-medium text-foreground hover:text-primary transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = `/profile/${post.author.username}`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.href = `/profile/${post.author.username}`;
                    }
                  }}
                >
                  <UserAvatar name={post.author.name} image={post.author.image} size="sm" />
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
              </div>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}

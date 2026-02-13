"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Calendar, Clock } from "lucide-react";
import { fadeIn, cardHover, cardTap } from "@/lib/motion";
import { formatDate, readingTime } from "@/lib/utils";
import { AnimeMetadata } from "./anime-metadata";
import { TagPill } from "@/components/tags/tag-pill";
import type { PostWithRelations } from "@/types";

interface PostCardProps {
  post: PostWithRelations;
}

export function PostCard({ post }: PostCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const maxVisibleTags = 3;
  const visibleTags = post.tags.slice(0, maxVisibleTags);
  const extraTagCount = post.tags.length - maxVisibleTags;

  return (
    <motion.div
      variants={fadeIn}
      whileHover={shouldReduceMotion ? undefined : cardHover}
      whileTap={shouldReduceMotion ? undefined : cardTap}
    >
      <Link href={`/posts/${post.slug}`} className="group block">
        <article className="overflow-hidden rounded-xl border border-border/50 bg-card transition-colors hover:border-primary/30">
          {/* Cover Image */}
          {post.coverImage && (
            <div className="relative aspect-video overflow-hidden">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          )}

          <div className="p-5">
            {/* Anime metadata */}
            <AnimeMetadata
              animeTitle={post.animeTitle}
              episodeNumber={post.episodeNumber}
              season={post.season}
              rating={post.rating}
            />

            {/* Title */}
            <h3 className="mt-3 line-clamp-2 text-lg font-semibold leading-snug tracking-tight group-hover:text-primary transition-colors">
              {post.title}
            </h3>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                {post.excerpt}
              </p>
            )}

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                {visibleTags.map(({ tag }) => (
                  <TagPill key={tag.id} name={tag.name} slug={tag.slug} />
                ))}
                {extraTagCount > 0 && (
                  <span className="text-xs text-muted-foreground">
                    +{extraTagCount}
                  </span>
                )}
              </div>
            )}

            {/* Footer: author + date + reading time */}
            <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {post.author.name}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(post.publishedAt ?? post.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {readingTime(post.contentMarkdown)}
              </span>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}

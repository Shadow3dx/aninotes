"use client";

import { StaggerContainer } from "@/components/motion/stagger-container";
import { PostCard } from "./post-card";
import type { PostWithRelations } from "@/types";

interface PostGridProps {
  posts: PostWithRelations[];
}

export function PostGrid({ posts }: PostGridProps) {
  if (posts.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg text-muted-foreground">No posts found.</p>
      </div>
    );
  }

  return (
    <StaggerContainer className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </StaggerContainer>
  );
}

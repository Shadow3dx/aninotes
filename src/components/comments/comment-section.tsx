"use client";

import { MessageCircle } from "lucide-react";
import { CommentForm } from "./comment-form";
import { CommentItem, type CommentData } from "./comment-item";

interface CommentSectionProps {
  postId: string;
  comments: CommentData[];
  isAdmin: boolean;
}

export function CommentSection({
  postId,
  comments,
  isAdmin,
}: CommentSectionProps) {
  // Build tree: only show top-level comments (parentId = null)
  const topLevel = comments.filter(
    (c) => !comments.some((p) => p.replies.some((r) => r.id === c.id))
  );

  const totalCount = countComments(comments);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">
          {totalCount} Comment{totalCount !== 1 ? "s" : ""}
        </h2>
      </div>

      <CommentForm postId={postId} />

      {topLevel.length > 0 ? (
        <div className="space-y-4">
          {topLevel.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-muted-foreground">
          No comments yet. Be the first to share your thoughts!
        </p>
      )}
    </div>
  );
}

function countComments(comments: CommentData[]): number {
  let count = 0;
  for (const c of comments) {
    count += 1 + countComments(c.replies);
  }
  return count;
}

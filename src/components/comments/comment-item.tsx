"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CommentForm } from "./comment-form";
import { deleteComment } from "@/actions/comments";

export interface CommentData {
  id: string;
  body: string;
  authorName: string;
  createdAt: string;
  replies: CommentData[];
}

interface CommentItemProps {
  comment: CommentData;
  postId: string;
  isAdmin: boolean;
  depth?: number;
}

export function CommentItem({
  comment,
  postId,
  isAdmin,
  depth = 0,
}: CommentItemProps) {
  const [replying, setReplying] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this comment and all its replies?")) return;
    setDeleting(true);
    try {
      await deleteComment(comment.id);
      toast.success("Comment deleted");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete"
      );
      setDeleting(false);
    }
  }

  const maxDepth = 3;

  return (
    <div className={depth > 0 ? "ml-6 border-l-2 border-border/50 pl-4" : ""}>
      <div className="group rounded-lg bg-muted/30 p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
            <User className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-sm font-medium">{comment.authorName}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>

        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {comment.body}
        </p>

        <div className="mt-2 flex items-center gap-2">
          {depth < maxDepth && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground"
              onClick={() => setReplying(!replying)}
            >
              <MessageCircle className="mr-1 h-3 w-3" />
              Reply
            </Button>
          )}
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-destructive opacity-0 group-hover:opacity-100"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          )}
        </div>
      </div>

      {replying && (
        <div className="ml-6 mt-3">
          <CommentForm
            postId={postId}
            parentId={comment.id}
            compact
            onSuccess={() => setReplying(false)}
            onCancel={() => setReplying(false)}
          />
        </div>
      )}

      {comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              isAdmin={isAdmin}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

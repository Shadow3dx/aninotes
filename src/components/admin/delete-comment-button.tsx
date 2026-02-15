"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteComment } from "@/actions/comments";

interface DeleteCommentButtonProps {
  commentId: string;
}

export function DeleteCommentButton({ commentId }: DeleteCommentButtonProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this comment and all its replies?")) return;
    setDeleting(true);
    try {
      await deleteComment(commentId);
      toast.success("Comment deleted");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete comment"
      );
      setDeleting(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-destructive"
      onClick={handleDelete}
      disabled={deleting}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}

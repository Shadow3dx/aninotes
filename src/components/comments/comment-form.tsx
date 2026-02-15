"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addComment } from "@/actions/comments";

interface CommentFormProps {
  postId: string;
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  compact?: boolean;
}

export function CommentForm({
  postId,
  parentId,
  onSuccess,
  onCancel,
  compact,
}: CommentFormProps) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.set("body", body);
      formData.set("authorName", name);
      formData.set("postId", postId);
      if (parentId) formData.set("parentId", parentId);

      await addComment(formData);
      toast.success(parentId ? "Reply posted!" : "Comment posted!");
      setBody("");
      onSuccess?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to post comment"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {!compact && (
        <h3 className="text-lg font-semibold">Leave a Comment</h3>
      )}
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        required
        className={compact ? "h-8 text-sm" : ""}
      />
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={parentId ? "Write a reply..." : "Share your thoughts..."}
        required
        rows={compact ? 2 : 4}
        className={compact ? "text-sm" : ""}
      />
      <div className="flex items-center gap-2">
        <Button type="submit" size={compact ? "sm" : "default"} disabled={saving}>
          <Send className="mr-2 h-3.5 w-3.5" />
          {saving ? "Posting..." : parentId ? "Reply" : "Post Comment"}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" size={compact ? "sm" : "default"} onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

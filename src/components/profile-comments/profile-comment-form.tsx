"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addProfileComment } from "@/actions/profile-comments";

interface ProfileCommentFormProps {
  profileId: string;
  parentId?: string;
  compact?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProfileCommentForm({
  profileId,
  parentId,
  compact,
  onSuccess,
  onCancel,
}: ProfileCommentFormProps) {
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!body.trim()) return;
    setSaving(true);

    try {
      const formData = new FormData();
      formData.set("body", body.trim());
      formData.set("profileId", profileId);
      if (parentId) formData.set("parentId", parentId);

      await addProfileComment(formData);
      setBody("");
      toast.success("Comment posted!");
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Leave a comment..."
        rows={compact ? 2 : 3}
        maxLength={2000}
        required
      />
      <div className="flex items-center gap-2">
        <Button type="submit" size={compact ? "sm" : "default"} disabled={saving || !body.trim()}>
          {saving ? "Posting..." : "Post"}
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

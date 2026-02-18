"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteProfileComment } from "@/actions/profile-comments";
import { ProfileCommentForm } from "./profile-comment-form";

export interface ProfileCommentData {
  id: string;
  body: string;
  userName: string;
  username: string;
  createdAt: string;
  isAuthor: boolean;
  replies: ProfileCommentData[];
}

interface ProfileCommentItemProps {
  comment: ProfileCommentData;
  profileId: string;
  isProfileOwner: boolean;
  isLoggedIn: boolean;
  depth?: number;
}

export function ProfileCommentItem({
  comment,
  profileId,
  isProfileOwner,
  isLoggedIn,
  depth = 0,
}: ProfileCommentItemProps) {
  const [showReply, setShowReply] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canDelete = comment.isAuthor || isProfileOwner;
  const canReply = isLoggedIn && depth < 3;

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteProfileComment(comment.id);
      toast.success("Comment deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
      setDeleting(false);
    }
  }

  return (
    <div className={depth > 0 ? "ml-6 border-l-2 border-border/50 pl-4" : ""}>
      <div className="group py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
            <User className="h-3.5 w-3.5 text-primary" />
          </div>
          <Link
            href={`/profile/${comment.username}`}
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            {comment.userName}
          </Link>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
        </div>

        <p className="mt-1.5 text-sm whitespace-pre-wrap">{comment.body}</p>

        <div className="mt-1.5 flex items-center gap-2">
          {canReply && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs text-muted-foreground"
              onClick={() => setShowReply(!showReply)}
            >
              <MessageCircle className="h-3 w-3" />
              Reply
            </Button>
          )}
          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 px-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={deleting}
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete comment?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this comment and all its replies.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {showReply && (
          <div className="mt-2">
            <ProfileCommentForm
              profileId={profileId}
              parentId={comment.id}
              compact
              onSuccess={() => setShowReply(false)}
              onCancel={() => setShowReply(false)}
            />
          </div>
        )}
      </div>

      {comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <ProfileCommentItem
              key={reply.id}
              comment={reply}
              profileId={profileId}
              isProfileOwner={isProfileOwner}
              isLoggedIn={isLoggedIn}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

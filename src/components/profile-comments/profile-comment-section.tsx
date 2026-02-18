"use client";

import { MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileCommentForm } from "./profile-comment-form";
import { ProfileCommentItem, type ProfileCommentData } from "./profile-comment-item";

interface ProfileCommentSectionProps {
  profileId: string;
  comments: ProfileCommentData[];
  isLoggedIn: boolean;
  isProfileOwner: boolean;
}

export function ProfileCommentSection({
  profileId,
  comments,
  isLoggedIn,
  isProfileOwner,
}: ProfileCommentSectionProps) {
  return (
    <Card className="mb-8">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-4 w-4" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoggedIn ? (
          <div className="mb-4">
            <ProfileCommentForm profileId={profileId} />
          </div>
        ) : (
          <p className="mb-4 text-sm text-muted-foreground">
            Sign in to leave a comment.
          </p>
        )}

        {comments.length > 0 ? (
          <div className="divide-y divide-border/50">
            {comments.map((comment) => (
              <ProfileCommentItem
                key={comment.id}
                comment={comment}
                profileId={profileId}
                isProfileOwner={isProfileOwner}
                isLoggedIn={isLoggedIn}
              />
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No comments yet. Be the first!
          </p>
        )}
      </CardContent>
    </Card>
  );
}

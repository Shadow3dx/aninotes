"use client";

import { useState } from "react";
import { toast } from "sonner";
import { UserPlus, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleFollow } from "@/actions/follows";

interface FollowButtonProps {
  targetUserId: string;
  initialFollowing: boolean;
}

export function FollowButton({ targetUserId, initialFollowing }: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    try {
      const result = await toggleFollow(targetUserId);
      setFollowing(result.following);
      toast.success(result.following ? "Following!" : "Unfollowed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant={following ? "secondary" : "default"}
      size="sm"
      onClick={handleToggle}
      disabled={loading}
    >
      {following ? (
        <>
          <UserCheck className="mr-1.5 h-4 w-4" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="mr-1.5 h-4 w-4" />
          Follow
        </>
      )}
    </Button>
  );
}

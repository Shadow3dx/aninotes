"use client";

import Link from "next/link";
import { formatRelativeDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/user-avatar";

interface ConversationItemProps {
  conversationId: string;
  otherUser: { name: string; username: string; image: string | null };
  lastMessage: { body: string; createdAt: string; senderId: string } | null;
  unreadCount: number;
  currentUserId: string;
}

export function ConversationItem({
  conversationId,
  otherUser,
  lastMessage,
  unreadCount,
  currentUserId,
}: ConversationItemProps) {
  const isOwnMessage = lastMessage?.senderId === currentUserId;

  return (
    <Link
      href={`/messages/${conversationId}`}
      className={cn(
        "flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50",
        unreadCount > 0 && "bg-primary/5 border-primary/20"
      )}
    >
      <UserAvatar name={otherUser.name} image={otherUser.image} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <span className={cn("text-sm font-medium", unreadCount > 0 && "font-semibold")}>
            {otherUser.name}
          </span>
          {lastMessage && (
            <span className="text-xs text-muted-foreground">
              {formatRelativeDate(lastMessage.createdAt)}
            </span>
          )}
        </div>
        {lastMessage && (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            {isOwnMessage && "You: "}
            {lastMessage.body}
          </p>
        )}
      </div>
      {unreadCount > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
          {unreadCount}
        </span>
      )}
    </Link>
  );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageBubble } from "./message-bubble";
import { MessageInput } from "./message-input";

interface MessageData {
  id: string;
  body: string;
  senderId: string;
  createdAt: string;
  sender: { id: string; name: string; username: string };
}

interface MessageThreadProps {
  conversationId: string;
  initialMessages: MessageData[];
  currentUserId: string;
  otherUser: { id: string; name: string; username: string };
}

export function MessageThread({
  conversationId,
  initialMessages,
  currentUserId,
  otherUser,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<MessageData[]>(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Scroll to bottom on initial load
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, []);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const lastMessage = messages[messages.length - 1];
        const after = lastMessage ? lastMessage.createdAt : new Date(0).toISOString();
        const res = await fetch(
          `/api/messages/poll?conversationId=${conversationId}&after=${encodeURIComponent(after)}`
        );
        if (!res.ok) return;
        const newMessages: MessageData[] = await res.json();
        if (newMessages.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const unique = newMessages.filter((m) => !existingIds.has(m.id));
            if (unique.length === 0) return prev;
            return [...prev, ...unique];
          });
          scrollToBottom();
        }
      } catch {
        // Silently ignore polling errors
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [conversationId, messages, scrollToBottom]);

  // Group messages by date
  let lastDate = "";

  return (
    <div className="flex h-full flex-col">
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => {
          const msgDate = new Date(msg.createdAt).toLocaleDateString();
          const showDate = msgDate !== lastDate;
          lastDate = msgDate;

          return (
            <div key={msg.id}>
              {showDate && (
                <div className="flex justify-center py-2">
                  <span className="rounded-full bg-muted px-3 py-1 text-[11px] text-muted-foreground">
                    {new Date(msg.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
              <MessageBubble
                body={msg.body}
                isSent={msg.senderId === currentUserId}
                timestamp={msg.createdAt}
                senderName={msg.senderId !== currentUserId ? msg.sender.name : undefined}
              />
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <MessageInput recipientId={otherUser.id} />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { markNotificationsRead, markAllNotificationsRead, deleteNotification } from "@/actions/notifications";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  type: string;
  body: string;
  readAt: string | null;
  createdAt: string;
  relatedPostId: string | null;
  relatedUser: {
    name: string;
    username: string;
    image: string | null;
  } | null;
}

export function NotificationList() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => setNotifications(data.notifications))
      .catch(() => toast.error("Failed to load notifications"))
      .finally(() => setLoading(false));
  }, []);

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() }))
      );
      toast.success("All marked as read");
    } catch {
      toast.error("Failed to mark notifications as read");
    }
  }

  async function handleMarkRead(id: string) {
    try {
      await markNotificationsRead([id]);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
      );
    } catch {
      toast.error("Something went wrong");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      toast.error("Something went wrong");
    }
  }

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Bell className="mb-2 h-8 w-8" />
        <p>No notifications yet</p>
      </div>
    );
  }

  function formatTime(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  }

  function getNotificationLink(n: NotificationItem): string | null {
    if (n.relatedPostId) return `/posts/${n.relatedPostId}`;
    if (n.relatedUser) return `/profile/${n.relatedUser.username}`;
    return null;
  }

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="mr-1.5 h-4 w-4" />
            Mark all as read
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {notifications.map((n) => {
          const link = getNotificationLink(n);
          const content = (
            <Card
              className={cn(
                "transition-colors",
                !n.readAt && "border-primary/30 bg-primary/5"
              )}
            >
              <CardContent className="flex items-start gap-3 p-4">
                <UserAvatar
                  name={n.relatedUser?.name ?? "User"}
                  image={n.relatedUser?.image}
                  size="sm"
                  className="flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{n.body}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatTime(n.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!n.readAt && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMarkRead(n.id);
                      }}
                      title="Mark as read"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDelete(n.id);
                    }}
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );

          if (link) {
            return (
              <Link key={n.id} href={link} className="block">
                {content}
              </Link>
            );
          }
          return <div key={n.id}>{content}</div>;
        })}
      </div>
    </div>
  );
}

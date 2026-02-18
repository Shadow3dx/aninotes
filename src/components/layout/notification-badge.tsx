"use client";

import { useEffect, useState } from "react";

export function NotificationBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function poll() {
      try {
        const res = await fetch("/api/notifications/unread");
        if (res.ok && mounted) {
          const data = await res.json();
          setCount(data.count);
        }
      } catch {
        // ignore
      }
    }

    poll();
    const interval = setInterval(poll, 30_000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (count === 0) return null;

  return (
    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
      {count > 99 ? "99+" : count}
    </span>
  );
}

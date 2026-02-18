"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface MemberSearchProps {
  initialQuery: string;
}

export function MemberSearch({ initialQuery }: MemberSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const trimmed = query.trim();
      if (trimmed) {
        router.push(`/members?q=${encodeURIComponent(trimmed)}`);
      } else {
        router.push("/members");
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, router]);

  return (
    <div className="relative mb-6">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search by name or username..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-9"
      />
    </div>
  );
}

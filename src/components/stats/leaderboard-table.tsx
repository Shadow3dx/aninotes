import Link from "next/link";
import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/user-avatar";

interface LeaderboardEntry {
  username: string;
  name: string;
  image: string | null;
  value: number;
}

interface LeaderboardTableProps {
  title: string;
  entries: LeaderboardEntry[];
  valueLabel: string;
}

export function LeaderboardTable({ title, entries, valueLabel }: LeaderboardTableProps) {
  if (entries.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {entries.map((entry, i) => (
            <Link
              key={entry.username}
              href={`/profile/${entry.username}`}
              className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
            >
              <span className="w-6 text-center text-sm font-bold text-muted-foreground">
                {i + 1}
              </span>
              <UserAvatar name={entry.name} image={entry.image} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{entry.name}</p>
                <p className="text-xs text-muted-foreground">@{entry.username}</p>
              </div>
              <span className="text-sm font-semibold text-primary">
                {entry.value.toLocaleString()} {valueLabel}
              </span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

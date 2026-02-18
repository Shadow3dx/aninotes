import Link from "next/link";
import { Trophy, User as UserIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
              {entry.image ? (
                <img
                  src={entry.image}
                  alt=""
                  className="h-8 w-8 rounded-full object-cover border"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
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

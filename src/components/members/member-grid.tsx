"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { User as UserIcon, Film, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { staggerContainer, fadeIn } from "@/lib/motion";
import { formatDate } from "@/lib/utils";

interface MemberUser {
  id: string;
  name: string;
  username: string;
  image: string | null;
  bio: string | null;
  createdAt: Date;
  _count: {
    animeEntries: number;
    mangaEntries: number;
  };
}

interface MemberGridProps {
  users: MemberUser[];
  query: string;
}

export function MemberGrid({ users, query }: MemberGridProps) {
  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-12">
          <UserIcon className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {query ? `No members found for "${query}"` : "No members yet."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {users.map((user) => {
        const initials = user.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        return (
          <motion.div key={user.id} variants={fadeIn}>
            <Link href={`/profile/${user.username}`}>
              <Card className="transition-colors hover:border-primary/30 hover:shadow-sm">
                <CardContent className="flex items-start gap-3 p-4">
                  <Avatar className="h-12 w-12 flex-shrink-0">
                    {user.image && (
                      <AvatarImage src={user.image} alt={user.name} />
                    )}
                    <AvatarFallback className="text-sm">
                      {initials || <UserIcon className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      @{user.username}
                    </p>
                    {user.bio && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {user.bio}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Film className="h-3 w-3" />
                        {user._count.animeEntries}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {user._count.mangaEntries}
                      </span>
                      <span>Joined {formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

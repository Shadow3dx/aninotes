import { Suspense } from "react";
import type { Metadata } from "next";
import { Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/layout/container";
import { MemberSearch } from "@/components/members/member-search";
import { MemberGrid } from "@/components/members/member-grid";

export const metadata: Metadata = {
  title: "Members",
  description: "Browse and search AniNotes community members",
};

interface MembersPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  const users = await prisma.user.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { username: { contains: query, mode: "insensitive" } },
          ],
        }
      : {},
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      bio: true,
      createdAt: true,
      _count: {
        select: {
          animeEntries: true,
          mangaEntries: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <Container className="py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Members</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Browse and discover AniNotes community members.
        </p>
      </div>

      <MemberSearch initialQuery={query} />

      <Suspense fallback={null}>
        <MemberGrid users={users} query={query} />
      </Suspense>
    </Container>
  );
}

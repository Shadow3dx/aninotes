import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q || q.length === 0) {
    return NextResponse.json([]);
  }

  const posts = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { animeTitle: { contains: q, mode: "insensitive" } },
        { excerpt: { contains: q, mode: "insensitive" } },
      ],
    },
    include: {
      author: true,
      tags: { include: { tag: true } },
      categories: { include: { category: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: 20,
  });

  return NextResponse.json(posts);
}

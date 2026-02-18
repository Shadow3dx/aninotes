"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

const REACTION_TYPES = ["LIKE", "LOVE", "INSIGHTFUL", "FUNNY"] as const;
type ReactionType = (typeof REACTION_TYPES)[number];

export async function toggleReaction(postId: string, type: ReactionType) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  if (!REACTION_TYPES.includes(type)) {
    throw new Error("Invalid reaction type");
  }

  const existing = await prisma.reaction.findUnique({
    where: {
      userId_postId_type: {
        userId: session.user.id,
        postId,
        type,
      },
    },
  });

  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
    return { added: false };
  }

  await prisma.reaction.create({
    data: {
      userId: session.user.id,
      postId,
      type,
    },
  });

  // Notify post author
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true, slug: true, title: true },
  });
  if (post) {
    const reactor = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    });
    const typeLabel = type.charAt(0) + type.slice(1).toLowerCase();
    await createNotification({
      userId: post.authorId,
      type: "REACTION",
      relatedUserId: session.user.id,
      relatedPostId: post.slug,
      body: `${reactor?.name ?? "Someone"} reacted ${typeLabel} to "${post.title}"`,
    });
  }

  return { added: true };
}

export async function getPostReactions(postId: string) {
  const session = await auth();

  const reactions = await prisma.reaction.groupBy({
    by: ["type"],
    where: { postId },
    _count: true,
  });

  const counts: Record<string, number> = {};
  for (const r of reactions) {
    counts[r.type] = r._count;
  }

  let userReactions: string[] = [];
  if (session?.user?.id) {
    const mine = await prisma.reaction.findMany({
      where: { postId, userId: session.user.id },
      select: { type: true },
    });
    userReactions = mine.map((r) => r.type);
  }

  return { counts, userReactions };
}

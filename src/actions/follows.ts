"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

export async function toggleFollow(targetUserId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  if (session.user.id === targetUserId) {
    throw new Error("You cannot follow yourself");
  }

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: targetUserId,
      },
    },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    return { following: false };
  }

  await prisma.follow.create({
    data: {
      followerId: session.user.id,
      followingId: targetUserId,
    },
  });

  // Notify the followed user
  const follower = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true },
  });
  await createNotification({
    userId: targetUserId,
    type: "FOLLOW",
    relatedUserId: session.user.id,
    body: `${follower?.name ?? "Someone"} started following you`,
  });

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { username: true },
  });
  if (targetUser) {
    revalidatePath(`/profile/${targetUser.username}`);
  }

  return { following: true };
}

export async function getFollowStatus(targetUserId: string) {
  const session = await auth();
  if (!session?.user?.id) return { isFollowing: false };

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: targetUserId,
      },
    },
  });

  return { isFollowing: !!existing };
}

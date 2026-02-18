"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";
import { z } from "zod";

const profileCommentSchema = z.object({
  body: z.string().min(1, "Comment cannot be empty").max(2000),
  profileId: z.string().min(1),
  parentId: z.string().optional(),
});

export async function addProfileComment(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("You must be logged in to comment");

  const data = profileCommentSchema.parse({
    body: formData.get("body"),
    profileId: formData.get("profileId"),
    parentId: formData.get("parentId") || undefined,
  });

  // Verify profile user exists
  const profileUser = await prisma.user.findUnique({
    where: { id: data.profileId },
    select: { username: true },
  });
  if (!profileUser) throw new Error("User not found");

  // If replying, verify parent exists and belongs to same profile
  if (data.parentId) {
    const parent = await prisma.profileComment.findUnique({
      where: { id: data.parentId },
    });
    if (!parent || parent.profileId !== data.profileId) {
      throw new Error("Invalid parent comment");
    }
  }

  await prisma.profileComment.create({
    data: {
      body: data.body,
      userId: session.user.id,
      profileId: data.profileId,
      parentId: data.parentId ?? null,
    },
  });

  // Notify profile owner
  const commenter = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true },
  });
  await createNotification({
    userId: data.profileId,
    type: "PROFILE_COMMENT",
    relatedUserId: session.user.id,
    body: `${commenter?.name ?? "Someone"} left a comment on your profile`,
  });

  revalidatePath(`/profile/${profileUser.username}`);
  return { success: true };
}

export async function deleteProfileComment(commentId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const comment = await prisma.profileComment.findUnique({
    where: { id: commentId },
    include: { profile: { select: { username: true } } },
  });
  if (!comment) throw new Error("Comment not found");

  // Only comment author or profile owner can delete
  if (comment.userId !== session.user.id && comment.profileId !== session.user.id) {
    throw new Error("You can only delete your own comments");
  }

  await prisma.profileComment.delete({ where: { id: commentId } });

  revalidatePath(`/profile/${comment.profile.username}`);
  return { success: true };
}

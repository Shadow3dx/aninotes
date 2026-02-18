import { prisma } from "@/lib/prisma";

interface CreateNotificationParams {
  userId: string;
  type: string;
  relatedUserId?: string;
  relatedPostId?: string;
  body: string;
}

export async function createNotification({
  userId,
  type,
  relatedUserId,
  relatedPostId,
  body,
}: CreateNotificationParams) {
  // Don't notify yourself
  if (relatedUserId && relatedUserId === userId) return;

  await prisma.notification.create({
    data: {
      userId,
      type,
      relatedUserId: relatedUserId ?? null,
      relatedPostId: relatedPostId ?? null,
      body,
    },
  });
}

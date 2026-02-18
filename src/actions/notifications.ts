"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function markNotificationsRead(ids: string[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.notification.updateMany({
    where: {
      id: { in: ids },
      userId: session.user.id,
    },
    data: { readAt: new Date() },
  });
}

export async function markAllNotificationsRead() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.notification.updateMany({
    where: {
      userId: session.user.id,
      readAt: null,
    },
    data: { readAt: new Date() },
  });
}

export async function deleteNotification(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.notification.deleteMany({
    where: {
      id,
      userId: session.user.id,
    },
  });
}

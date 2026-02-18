import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ notifications: [] });
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      relatedUser: { select: { name: true, username: true, image: true } },
    },
  });

  return NextResponse.json({
    notifications: notifications.map((n) => ({
      id: n.id,
      type: n.type,
      body: n.body,
      readAt: n.readAt?.toISOString() ?? null,
      createdAt: n.createdAt.toISOString(),
      relatedPostId: n.relatedPostId,
      relatedUser: n.relatedUser
        ? {
            name: n.relatedUser.name,
            username: n.relatedUser.username,
            image: n.relatedUser.image,
          }
        : null,
    })),
  });
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversationId = request.nextUrl.searchParams.get("conversationId");
  const after = request.nextUrl.searchParams.get("after");

  if (!conversationId) {
    return NextResponse.json({ error: "conversationId required" }, { status: 400 });
  }

  // Verify user is a participant
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });
  if (
    !conversation ||
    (conversation.participant1Id !== session.user.id &&
      conversation.participant2Id !== session.user.id)
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const messages = await prisma.message.findMany({
    where: {
      conversationId,
      ...(after && { createdAt: { gt: new Date(after) } }),
    },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { select: { id: true, name: true, username: true } },
    },
  });

  // Mark messages from the other person as read
  if (messages.some((m) => m.senderId !== session.user.id && !m.readAt)) {
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: session.user.id },
        readAt: null,
      },
      data: { readAt: new Date() },
    });
  }

  return NextResponse.json(messages);
}

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const sendMessageSchema = z.object({
  recipientId: z.string().min(1),
  body: z.string().min(1, "Message cannot be empty").max(5000),
});

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session;
}

// Normalize participant order so the unique constraint works
function orderParticipants(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export async function sendMessage(formData: FormData) {
  const session = await requireAuth();

  const data = sendMessageSchema.parse({
    recipientId: formData.get("recipientId"),
    body: formData.get("body"),
  });

  if (data.recipientId === session.user.id) {
    throw new Error("You cannot message yourself");
  }

  // Verify recipient exists
  const recipient = await prisma.user.findUnique({
    where: { id: data.recipientId },
    select: { id: true },
  });
  if (!recipient) throw new Error("User not found");

  const [p1, p2] = orderParticipants(session.user.id, data.recipientId);

  // Find or create conversation
  let conversation = await prisma.conversation.findUnique({
    where: { participant1Id_participant2Id: { participant1Id: p1, participant2Id: p2 } },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { participant1Id: p1, participant2Id: p2 },
    });
  }

  // Create message
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: session.user.id,
      body: data.body,
    },
  });

  // Touch conversation updatedAt
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() },
  });

  revalidatePath("/messages");
  revalidatePath(`/messages/${conversation.id}`);
  return { success: true, conversationId: conversation.id };
}

export async function getOrCreateConversation(recipientId: string) {
  const session = await requireAuth();

  if (recipientId === session.user.id) {
    throw new Error("You cannot message yourself");
  }

  const [p1, p2] = orderParticipants(session.user.id, recipientId);

  let conversation = await prisma.conversation.findUnique({
    where: { participant1Id_participant2Id: { participant1Id: p1, participant2Id: p2 } },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { participant1Id: p1, participant2Id: p2 },
    });
  }

  return conversation.id;
}

export async function markConversationRead(conversationId: string) {
  const session = await requireAuth();

  // Verify user is a participant
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });
  if (
    !conversation ||
    (conversation.participant1Id !== session.user.id &&
      conversation.participant2Id !== session.user.id)
  ) {
    throw new Error("Not found");
  }

  // Mark all unread messages from the other person as read
  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: session.user.id },
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  revalidatePath("/messages");
  return { success: true };
}

export async function getUnreadCount() {
  const session = await auth();
  if (!session?.user?.id) return 0;

  return prisma.message.count({
    where: {
      conversation: {
        OR: [
          { participant1Id: session.user.id },
          { participant2Id: session.user.id },
        ],
      },
      senderId: { not: session.user.id },
      readAt: null,
    },
  });
}

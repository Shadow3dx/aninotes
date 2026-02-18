import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { MessageThread } from "@/components/messages/message-thread";

interface ConversationPageProps {
  params: Promise<{ conversationId: string }>;
}

export async function generateMetadata({ params }: ConversationPageProps) {
  const { conversationId } = await params;
  const session = await auth();
  if (!session?.user?.id) return { title: "Messages" };

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participant1: { select: { name: true } },
      participant2: { select: { name: true } },
    },
  });

  if (!conversation) return { title: "Messages" };

  const otherUser =
    conversation.participant1Id === session.user.id
      ? conversation.participant2
      : conversation.participant1;

  return { title: `Chat with ${otherUser.name}` };
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { conversationId } = await params;
  const userId = session.user.id;

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participant1: { select: { id: true, name: true, username: true } },
      participant2: { select: { id: true, name: true, username: true } },
    },
  });

  if (!conversation) notFound();

  // Verify current user is a participant
  if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
    notFound();
  }

  const otherUser =
    conversation.participant1Id === userId
      ? conversation.participant2
      : conversation.participant1;

  // Fetch messages
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { select: { id: true, name: true, username: true } },
    },
  });

  // Mark messages as read (direct Prisma call, not a server action)
  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  const serializedMessages = messages.map((m) => ({
    id: m.id,
    body: m.body,
    senderId: m.senderId,
    createdAt: m.createdAt.toISOString(),
    sender: m.sender,
  }));

  return (
    <Container className="py-4">
      <div className="mx-auto flex h-[calc(100vh-10rem)] max-w-2xl flex-col">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3 border-b pb-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/messages">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <Link
              href={`/profile/${otherUser.username}`}
              className="font-semibold hover:underline"
            >
              {otherUser.name}
            </Link>
            <p className="text-xs text-muted-foreground">@{otherUser.username}</p>
          </div>
        </div>

        {/* Thread */}
        <div className="flex-1 overflow-hidden rounded-lg border">
          <MessageThread
            conversationId={conversationId}
            initialMessages={serializedMessages}
            currentUserId={userId}
            otherUser={otherUser}
          />
        </div>
      </div>
    </Container>
  );
}

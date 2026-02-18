import { redirect } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/layout/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConversationItem } from "@/components/messages/conversation-item";

export const metadata = {
  title: "Messages",
};

export default async function InboxPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  // Fetch all conversations with last message and unread count
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { participant1Id: userId },
        { participant2Id: userId },
      ],
    },
    include: {
      participant1: { select: { id: true, name: true, username: true, image: true } },
      participant2: { select: { id: true, name: true, username: true, image: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { body: true, createdAt: true, senderId: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Compute unread counts
  const unreadCounts = await Promise.all(
    conversations.map((c) =>
      prisma.message.count({
        where: {
          conversationId: c.id,
          senderId: { not: userId },
          readAt: null,
        },
      })
    )
  );

  return (
    <Container className="py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your conversations with other users.
          </p>
        </div>

        {conversations.length > 0 ? (
          <div className="space-y-2">
            {conversations.map((conv, i) => {
              const otherUser =
                conv.participant1Id === userId ? conv.participant2 : conv.participant1;
              const lastMessage = conv.messages[0] ?? null;

              return (
                <ConversationItem
                  key={conv.id}
                  conversationId={conv.id}
                  otherUser={otherUser}
                  lastMessage={
                    lastMessage
                      ? {
                          body: lastMessage.body,
                          createdAt: lastMessage.createdAt.toISOString(),
                          senderId: lastMessage.senderId,
                        }
                      : null
                  }
                  unreadCount={unreadCounts[i]}
                  currentUserId={userId}
                />
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center py-12">
              <MessageCircle className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No conversations yet. Visit a user&apos;s profile to send them a message.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Container>
  );
}

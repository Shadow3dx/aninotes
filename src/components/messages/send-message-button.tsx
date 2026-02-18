"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getOrCreateConversation } from "@/actions/messages";

interface SendMessageButtonProps {
  recipientId: string;
}

export function SendMessageButton({ recipientId }: SendMessageButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const conversationId = await getOrCreateConversation(recipientId);
      if (conversationId) {
        router.push(`/messages/${conversationId}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={loading}
      className="gap-1.5"
    >
      <MessageCircle className="h-4 w-4" />
      {loading ? "Opening..." : "Message"}
    </Button>
  );
}

"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendMessage } from "@/actions/messages";

interface MessageInputProps {
  recipientId: string;
}

export function MessageInput({ recipientId }: MessageInputProps) {
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);

    try {
      const formData = new FormData();
      formData.set("recipientId", recipientId);
      formData.set("body", body.trim());
      await sendMessage(formData);
      setBody("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 border-t p-3">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        rows={1}
        maxLength={5000}
        className="min-h-[40px] max-h-[120px] resize-none"
      />
      <Button
        type="submit"
        size="icon"
        disabled={sending || !body.trim()}
        className="h-10 w-10 flex-shrink-0"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}

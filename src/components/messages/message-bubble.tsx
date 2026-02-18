import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  body: string;
  isSent: boolean;
  timestamp: string;
  senderName?: string;
}

export function MessageBubble({ body, isSent, timestamp, senderName }: MessageBubbleProps) {
  return (
    <div className={cn("flex", isSent ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-3.5 py-2",
          isSent
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted rounded-bl-md"
        )}
      >
        {!isSent && senderName && (
          <p className="mb-0.5 text-[11px] font-medium text-muted-foreground">
            {senderName}
          </p>
        )}
        <p className="text-sm whitespace-pre-wrap break-words">{body}</p>
        <p
          className={cn(
            "mt-0.5 text-[10px]",
            isSent ? "text-primary-foreground/60" : "text-muted-foreground"
          )}
        >
          {new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}

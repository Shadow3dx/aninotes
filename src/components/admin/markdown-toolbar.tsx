"use client";

import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link2,
  Image,
  Minus,
  Strikethrough,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

interface MarkdownToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onUpdate: (value: string) => void;
}

type InsertAction = {
  label: string;
  icon: React.ElementType;
  prefix: string;
  suffix?: string;
  block?: boolean;
  placeholder?: string;
};

const actions: (InsertAction | "separator")[] = [
  { label: "Bold", icon: Bold, prefix: "**", suffix: "**", placeholder: "bold text" },
  { label: "Italic", icon: Italic, prefix: "*", suffix: "*", placeholder: "italic text" },
  { label: "Strikethrough", icon: Strikethrough, prefix: "~~", suffix: "~~", placeholder: "strikethrough" },
  "separator",
  { label: "Heading 2", icon: Heading2, prefix: "## ", block: true, placeholder: "Heading" },
  { label: "Heading 3", icon: Heading3, prefix: "### ", block: true, placeholder: "Heading" },
  "separator",
  { label: "Bullet List", icon: List, prefix: "- ", block: true, placeholder: "List item" },
  { label: "Numbered List", icon: ListOrdered, prefix: "1. ", block: true, placeholder: "List item" },
  { label: "Blockquote", icon: Quote, prefix: "> ", block: true, placeholder: "Quote" },
  "separator",
  { label: "Code", icon: Code, prefix: "`", suffix: "`", placeholder: "code" },
  { label: "Link", icon: Link2, prefix: "[", suffix: "](url)", placeholder: "link text" },
  { label: "Image", icon: Image, prefix: "![", suffix: "](url)", placeholder: "alt text" },
  "separator",
  { label: "Horizontal Rule", icon: Minus, prefix: "\n---\n", block: true, placeholder: "" },
];

export function MarkdownToolbar({ textareaRef, onUpdate }: MarkdownToolbarProps) {
  function insertMarkdown(action: InsertAction) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.slice(start, end);

    let insertion: string;
    let cursorOffset: number;

    if (action.block) {
      // Block-level: ensure we're on a new line
      const beforeCursor = text.slice(0, start);
      const needsNewline = beforeCursor.length > 0 && !beforeCursor.endsWith("\n");
      const prefix = (needsNewline ? "\n" : "") + action.prefix;
      const content = selectedText || action.placeholder || "";
      insertion = prefix + content;
      cursorOffset = prefix.length;
    } else {
      // Inline: wrap selection
      const content = selectedText || action.placeholder || "";
      insertion = action.prefix + content + (action.suffix || "");
      cursorOffset = action.prefix.length;
    }

    const newText = text.slice(0, start) + insertion + text.slice(end);
    onUpdate(newText);

    // Restore cursor position
    requestAnimationFrame(() => {
      textarea.focus();
      if (selectedText) {
        // If text was selected, place cursor after the insertion
        textarea.selectionStart = start + insertion.length;
        textarea.selectionEnd = start + insertion.length;
      } else {
        // If no selection, select the placeholder
        const placeholderLen = (action.placeholder || "").length;
        textarea.selectionStart = start + cursorOffset;
        textarea.selectionEnd = start + cursorOffset + placeholderLen;
      }
    });
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-wrap items-center gap-0.5 rounded-t-lg border border-b-0 bg-muted/50 p-1.5">
        {actions.map((action, i) => {
          if (action === "separator") {
            return <Separator key={i} orientation="vertical" className="mx-1 h-6" />;
          }
          return (
            <Tooltip key={action.label}>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => insertMarkdown(action)}
                >
                  <action.icon className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {action.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

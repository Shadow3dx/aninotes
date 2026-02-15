"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

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

const actions: (InsertAction | "separator" | "image")[] = [
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
  "image",
  "separator",
  { label: "Horizontal Rule", icon: Minus, prefix: "\n---\n", block: true, placeholder: "" },
];

const sizePresets = [
  { label: "Small", value: "25%" },
  { label: "Medium", value: "50%" },
  { label: "Large", value: "75%" },
  { label: "Full", value: "100%" },
];

export function MarkdownToolbar({ textareaRef, onUpdate }: MarkdownToolbarProps) {
  const [imageOpen, setImageOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageSize, setImageSize] = useState("100%");
  const [customSize, setCustomSize] = useState("");

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
      const beforeCursor = text.slice(0, start);
      const needsNewline = beforeCursor.length > 0 && !beforeCursor.endsWith("\n");
      const prefix = (needsNewline ? "\n" : "") + action.prefix;
      const content = selectedText || action.placeholder || "";
      insertion = prefix + content;
      cursorOffset = prefix.length;
    } else {
      const content = selectedText || action.placeholder || "";
      insertion = action.prefix + content + (action.suffix || "");
      cursorOffset = action.prefix.length;
    }

    const newText = text.slice(0, start) + insertion + text.slice(end);
    onUpdate(newText);

    requestAnimationFrame(() => {
      textarea.focus();
      if (selectedText) {
        textarea.selectionStart = start + insertion.length;
        textarea.selectionEnd = start + insertion.length;
      } else {
        const placeholderLen = (action.placeholder || "").length;
        textarea.selectionStart = start + cursorOffset;
        textarea.selectionEnd = start + cursorOffset + placeholderLen;
      }
    });
  }

  function insertImage() {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const url = imageUrl.trim() || "url";
    const alt = imageAlt.trim() || "image";
    const width = customSize.trim() || imageSize;

    const start = textarea.selectionStart;
    const text = textarea.value;

    const beforeCursor = text.slice(0, start);
    const needsNewline = beforeCursor.length > 0 && !beforeCursor.endsWith("\n");
    const prefix = needsNewline ? "\n" : "";

    let insertion: string;
    if (width === "100%") {
      // Full width — use simple markdown syntax
      insertion = `${prefix}![${alt}](${url})`;
    } else {
      // Sized — use HTML img tag
      insertion = `${prefix}<img src="${url}" alt="${alt}" width="${width}" />`;
    }

    const newText = text.slice(0, start) + insertion + text.slice(start);
    onUpdate(newText);

    // Reset form & close
    setImageUrl("");
    setImageAlt("");
    setImageSize("100%");
    setCustomSize("");
    setImageOpen(false);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.selectionStart = start + insertion.length;
      textarea.selectionEnd = start + insertion.length;
    });
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-wrap items-center gap-0.5 rounded-t-lg border border-b-0 bg-muted/50 p-1.5">
        {actions.map((action, i) => {
          if (action === "separator") {
            return <Separator key={i} orientation="vertical" className="mx-1 h-6" />;
          }

          if (action === "image") {
            return (
              <Popover key="image" open={imageOpen} onOpenChange={setImageOpen}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                      >
                        <Image className="h-3.5 w-3.5" />
                      </Button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    Image
                  </TooltipContent>
                </Tooltip>
                <PopoverContent className="w-80" align="start">
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Insert Image</p>

                    <div className="space-y-1.5">
                      <Label htmlFor="img-url" className="text-xs">Image URL</Label>
                      <Input
                        id="img-url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="h-8 text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="img-alt" className="text-xs">Alt Text</Label>
                      <Input
                        id="img-alt"
                        value={imageAlt}
                        onChange={(e) => setImageAlt(e.target.value)}
                        placeholder="Description of image"
                        className="h-8 text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Size</Label>
                      <div className="flex gap-1.5">
                        {sizePresets.map((preset) => (
                          <Button
                            key={preset.value}
                            type="button"
                            variant={imageSize === preset.value && !customSize ? "default" : "outline"}
                            size="sm"
                            className={cn("h-7 flex-1 text-xs", imageSize === preset.value && !customSize && "ring-1 ring-primary")}
                            onClick={() => {
                              setImageSize(preset.value);
                              setCustomSize("");
                            }}
                          >
                            {preset.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="img-custom" className="text-xs">Custom Width</Label>
                      <Input
                        id="img-custom"
                        value={customSize}
                        onChange={(e) => setCustomSize(e.target.value)}
                        placeholder="e.g. 300px or 60%"
                        className="h-8 text-sm"
                      />
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      className="w-full"
                      onClick={insertImage}
                    >
                      Insert Image
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            );
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

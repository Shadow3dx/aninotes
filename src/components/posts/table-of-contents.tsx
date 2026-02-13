"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { TocHeading } from "@/lib/markdown";

interface TableOfContentsProps {
  headings: TocHeading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    for (const heading of headings) {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="sticky top-24 space-y-1">
      <p className="mb-3 text-sm font-semibold text-foreground">
        On this page
      </p>
      {headings.map((heading) => (
        <a
          key={heading.id}
          href={`#${heading.id}`}
          onClick={(e) => {
            e.preventDefault();
            document.getElementById(heading.id)?.scrollIntoView({
              behavior: "smooth",
            });
          }}
          className={cn(
            "block text-sm transition-colors",
            heading.level === 3 ? "pl-4" : "",
            activeId === heading.id
              ? "text-primary font-medium"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {heading.text}
        </a>
      ))}
    </nav>
  );
}

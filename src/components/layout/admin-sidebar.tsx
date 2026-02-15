"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  Tags,
  FolderOpen,
  Settings,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/posts", label: "Posts", icon: FileText },
  { href: "/admin/tags", label: "Tags", icon: Tags },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border/40 bg-card">
      <div className="flex h-16 items-center border-b border-border/40 px-6">
        <Link href="/admin" className="text-lg font-bold tracking-tight">
          Ani<span className="text-primary">Notes</span>
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            Admin
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {sidebarLinks.map((link) => {
          const isActive =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/40 p-4 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          View Site
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}

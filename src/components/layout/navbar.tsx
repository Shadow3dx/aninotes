"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, Search, Shield, Library, LogIn, User, Settings, LogOut, MessageCircle } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { UnreadBadge } from "./unread-badge";
import { Container } from "./container";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
  { href: "/tags", label: "Tags" },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const role = session?.user?.role;
  const [open, setOpen] = useState(false);

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <Container>
        <nav className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">
              Ani<span className="text-primary">Notes</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-x-0 -bottom-[1px] h-0.5 bg-primary"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link href="/search" className="md:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Search className="h-4 w-4" />
              </Button>
            </Link>
            <ThemeToggle />

            {/* User dropdown (logged in) */}
            {session && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="hidden md:inline-flex">
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                    <Avatar className="h-8 w-8">
                      {session.user.image && (
                        <AvatarImage src={session.user.image} alt={session.user.name ?? ""} />
                      )}
                      <AvatarFallback className="text-xs">
                        {initials || <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{session.user.name}</p>
                    <p className="text-xs text-muted-foreground">@{session.user.username}</p>
                  </div>
                  <DropdownMenuSeparator />
                  {session.user.username && (
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${session.user.username}`}>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/my-list">
                      <Library className="mr-2 h-4 w-4" />
                      My List
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/messages" className="relative">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Messages
                      <UnreadBadge />
                    </Link>
                  </DropdownMenuItem>
                  {(role === "ADMIN" || role === "EDITOR") && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/my-list/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Sign in (logged out) */}
            {!session && status !== "loading" && (
              <Link href="/login" className="hidden md:inline-flex">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile menu */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="mt-8 flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "text-lg font-medium transition-colors",
                        pathname === link.href ||
                          (link.href !== "/" && pathname.startsWith(link.href))
                          ? "text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                  {session && (
                    <>
                      {session.user.username && (
                        <Link
                          href={`/profile/${session.user.username}`}
                          onClick={() => setOpen(false)}
                          className="text-lg font-medium text-muted-foreground hover:text-foreground"
                        >
                          Profile
                        </Link>
                      )}
                      <Link
                        href="/my-list"
                        onClick={() => setOpen(false)}
                        className="text-lg font-medium text-muted-foreground hover:text-foreground"
                      >
                        My List
                      </Link>
                      <Link
                        href="/messages"
                        onClick={() => setOpen(false)}
                        className="relative inline-flex items-center gap-2 text-lg font-medium text-muted-foreground hover:text-foreground"
                      >
                        Messages
                        <UnreadBadge />
                      </Link>
                      <Link
                        href="/my-list/settings"
                        onClick={() => setOpen(false)}
                        className="text-lg font-medium text-muted-foreground hover:text-foreground"
                      >
                        Settings
                      </Link>
                    </>
                  )}
                  {session && (role === "ADMIN" || role === "EDITOR") && (
                    <Link
                      href="/admin"
                      onClick={() => setOpen(false)}
                      className="text-lg font-medium text-muted-foreground hover:text-foreground"
                    >
                      Admin
                    </Link>
                  )}
                  {session ? (
                    <button
                      onClick={() => {
                        setOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="text-left text-lg font-medium text-destructive hover:text-destructive/80"
                    >
                      Sign Out
                    </button>
                  ) : (
                    status !== "loading" && (
                      <Link
                        href="/login"
                        onClick={() => setOpen(false)}
                        className="text-lg font-medium text-primary hover:text-primary/80"
                      >
                        Sign In
                      </Link>
                    )
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </Container>
    </header>
  );
}

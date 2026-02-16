import type { Post, User, Tag, Category, AnimeEntry, MangaEntry } from "@prisma/client";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role?: string;
    username?: string;
  }
  interface Session {
    user: {
      id: string;
      role: string;
      username: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    username: string;
  }
}

export type PostWithRelations = Post & {
  author: User;
  tags: { tag: Tag }[];
  categories: { category: Category }[];
};

export type PostStatus = "DRAFT" | "PUBLISHED" | "SCHEDULED";

export type { AnimeEntry, MangaEntry };

export interface TrackingStats {
  total: number;
  watching: number;
  completed: number;
  onHold: number;
  dropped: number;
  planTo: number;
  avgScore: number | null;
  totalProgress: number;
}

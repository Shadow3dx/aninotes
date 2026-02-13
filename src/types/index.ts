import type { Post, User, Tag, Category } from "@prisma/client";

export type PostWithRelations = Post & {
  author: User;
  tags: { tag: Tag }[];
  categories: { category: Category }[];
};

export type PostStatus = "DRAFT" | "PUBLISHED" | "SCHEDULED";

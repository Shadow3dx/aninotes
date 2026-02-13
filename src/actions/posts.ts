"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { postSchema } from "@/lib/validations/post";
import { slugify } from "@/lib/utils";

export async function createPost(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const raw = Object.fromEntries(formData.entries());
  const tagIds = formData.getAll("tagIds") as string[];
  const categoryIds = formData.getAll("categoryIds") as string[];

  const data = postSchema.parse({
    ...raw,
    slug: raw.slug || slugify(raw.title as string),
    tagIds,
    categoryIds,
  });

  const post = await prisma.post.create({
    data: {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || null,
      contentMarkdown: data.contentMarkdown,
      coverImage: data.coverImage || null,
      animeTitle: data.animeTitle,
      episodeNumber: data.episodeNumber,
      season: data.season,
      rating: data.rating,
      status: data.status,
      publishAt: data.publishAt ? new Date(data.publishAt) : null,
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      authorId: session.user.id,
      tags: {
        create: data.tagIds.map((tagId) => ({ tagId })),
      },
      categories: {
        create: data.categoryIds.map((categoryId) => ({ categoryId })),
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/posts");
  return { success: true, id: post.id };
}

export async function updatePost(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const raw = Object.fromEntries(formData.entries());
  const tagIds = formData.getAll("tagIds") as string[];
  const categoryIds = formData.getAll("categoryIds") as string[];

  const data = postSchema.parse({
    ...raw,
    tagIds,
    categoryIds,
  });

  // Get old post to check if status changed
  const oldPost = await prisma.post.findUnique({ where: { id } });

  await prisma.post.update({
    where: { id },
    data: {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || null,
      contentMarkdown: data.contentMarkdown,
      coverImage: data.coverImage || null,
      animeTitle: data.animeTitle,
      episodeNumber: data.episodeNumber,
      season: data.season,
      rating: data.rating,
      status: data.status,
      publishAt: data.publishAt ? new Date(data.publishAt) : null,
      publishedAt:
        data.status === "PUBLISHED" && oldPost?.status !== "PUBLISHED"
          ? new Date()
          : oldPost?.publishedAt,
      tags: {
        deleteMany: {},
        create: data.tagIds.map((tagId) => ({ tagId })),
      },
      categories: {
        deleteMany: {},
        create: data.categoryIds.map((categoryId) => ({ categoryId })),
      },
    },
  });

  revalidatePath("/");
  revalidatePath(`/posts/${data.slug}`);
  revalidatePath("/admin/posts");
  return { success: true };
}

export async function deletePost(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const post = await prisma.post.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/admin/posts");
  return { success: true, slug: post.slug };
}

export async function togglePublishPost(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) throw new Error("Post not found");

  const newStatus = post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

  await prisma.post.update({
    where: { id },
    data: {
      status: newStatus,
      publishedAt: newStatus === "PUBLISHED" ? new Date() : post.publishedAt,
    },
  });

  revalidatePath("/");
  revalidatePath(`/posts/${post.slug}`);
  revalidatePath("/admin/posts");
  return { success: true, status: newStatus };
}

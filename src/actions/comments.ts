"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const addCommentSchema = z.object({
  body: z.string().min(1, "Comment cannot be empty").max(2000),
  authorName: z.string().min(1, "Name is required").max(100),
  postId: z.string().min(1),
  parentId: z.string().optional(),
});

export async function addComment(formData: FormData) {
  const data = addCommentSchema.parse({
    body: formData.get("body"),
    authorName: formData.get("authorName"),
    postId: formData.get("postId"),
    parentId: formData.get("parentId") || undefined,
  });

  // Verify post exists and is published
  const post = await prisma.post.findUnique({
    where: { id: data.postId },
    select: { slug: true, status: true },
  });
  if (!post || post.status !== "PUBLISHED") {
    throw new Error("Post not found");
  }

  // If replying, verify parent comment exists and belongs to same post
  if (data.parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: data.parentId },
      select: { postId: true },
    });
    if (!parent || parent.postId !== data.postId) {
      throw new Error("Parent comment not found");
    }
  }

  await prisma.comment.create({
    data: {
      body: data.body,
      authorName: data.authorName,
      postId: data.postId,
      parentId: data.parentId ?? null,
    },
  });

  revalidatePath(`/posts/${post.slug}`);
  return { success: true };
}

export async function deleteComment(commentId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { post: { select: { slug: true } } },
  });
  if (!comment) throw new Error("Comment not found");

  await prisma.comment.delete({ where: { id: commentId } });

  revalidatePath(`/posts/${comment.post.slug}`);
  revalidatePath("/admin");
  return { success: true };
}

import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
  });

  const tags = await prisma.tag.findMany({
    select: { slug: true },
  });

  const categories = await prisma.category.findMany({
    select: { slug: true },
  });

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/search`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${baseUrl}/tags`, changeFrequency: "weekly", priority: 0.6 },
    ...posts.map((post) => ({
      url: `${baseUrl}/posts/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...tags.map((tag) => ({
      url: `${baseUrl}/tags/${tag.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...categories.map((cat) => ({
      url: `${baseUrl}/categories/${cat.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}

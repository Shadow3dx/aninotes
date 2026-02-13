import { prisma } from "@/lib/prisma";

export async function GET() {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 50,
    include: { author: true },
  });

  const items = posts
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/posts/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/posts/${post.slug}</guid>
      <description><![CDATA[${post.excerpt || `${post.animeTitle} ${post.season} Episode ${post.episodeNumber} - Rating: ${post.rating}/10`}]]></description>
      <pubDate>${(post.publishedAt ?? post.createdAt).toUTCString()}</pubDate>
      <author>${post.author.email} (${post.author.name})</author>
    </item>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AniNotes - Anime Episode Reviews</title>
    <link>${baseUrl}</link>
    <description>Personal anime episode reviews and opinions</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

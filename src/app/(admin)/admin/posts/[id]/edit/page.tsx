import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PostEditor } from "@/components/admin/post-editor";

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;

  const [post, tags, categories] = await Promise.all([
    prisma.post.findUnique({
      where: { id },
      include: {
        tags: { select: { tagId: true } },
        categories: { select: { categoryId: true } },
      },
    }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!post) notFound();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Edit Review</h1>
        <p className="text-muted-foreground">{post.title}</p>
      </div>
      <PostEditor post={post} allTags={tags} allCategories={categories} />
    </div>
  );
}

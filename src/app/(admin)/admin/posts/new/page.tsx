import { prisma } from "@/lib/prisma";
import { PostEditor } from "@/components/admin/post-editor";

export default async function NewPostPage() {
  const [tags, categories] = await Promise.all([
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">New Review</h1>
        <p className="text-muted-foreground">
          Write a new anime episode review.
        </p>
      </div>
      <PostEditor allTags={tags} allCategories={categories} />
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { TagManager } from "@/components/admin/tag-manager";

export default async function AdminTagsPage() {
  const tags = await prisma.tag.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Tags</h1>
        <p className="text-muted-foreground">Manage genre tags for reviews.</p>
      </div>
      <TagManager tags={tags} />
    </div>
  );
}

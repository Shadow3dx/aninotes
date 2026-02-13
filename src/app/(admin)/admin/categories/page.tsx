import { prisma } from "@/lib/prisma";
import { CategoryManager } from "@/components/admin/category-manager";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Categories</h1>
        <p className="text-muted-foreground">
          Manage categories for reviews.
        </p>
      </div>
      <CategoryManager categories={categories} />
    </div>
  );
}

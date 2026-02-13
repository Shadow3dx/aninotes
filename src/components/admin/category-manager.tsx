"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { createCategory, deleteCategory } from "@/actions/categories";

interface CategoryManagerProps {
  categories: {
    id: string;
    name: string;
    slug: string;
    _count: { posts: number };
  }[];
}

export function CategoryManager({ categories }: CategoryManagerProps) {
  const router = useRouter();
  const [name, setName] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const formData = new FormData();
      formData.set("name", name.trim());
      await createCategory(formData);
      toast.success(`Category "${name}" created!`);
      setName("");
      router.refresh();
    } catch {
      toast.error("Failed to create category");
    }
  }

  async function handleDelete(id: string, catName: string) {
    try {
      await deleteCategory(id);
      toast.success(`Category "${catName}" deleted.`);
      router.refresh();
    } catch {
      toast.error("Failed to delete category");
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name..."
          className="max-w-xs"
        />
        <Button type="submit" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </form>

      <div className="space-y-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <div className="flex items-center gap-3">
              <Badge variant="outline">{cat.name}</Badge>
              <span className="text-sm text-muted-foreground">
                {cat._count.posts} post{cat._count.posts !== 1 ? "s" : ""}
              </span>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Delete category &quot;{cat.name}&quot;?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove the category from all posts.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>
    </div>
  );
}

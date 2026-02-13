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
import { createTag, deleteTag } from "@/actions/tags";

interface TagManagerProps {
  tags: { id: string; name: string; slug: string; _count: { posts: number } }[];
}

export function TagManager({ tags }: TagManagerProps) {
  const router = useRouter();
  const [name, setName] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const formData = new FormData();
      formData.set("name", name.trim());
      await createTag(formData);
      toast.success(`Tag "${name}" created!`);
      setName("");
      router.refresh();
    } catch {
      toast.error("Failed to create tag");
    }
  }

  async function handleDelete(id: string, tagName: string) {
    try {
      await deleteTag(id);
      toast.success(`Tag "${tagName}" deleted.`);
      router.refresh();
    } catch {
      toast.error("Failed to delete tag");
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New tag name..."
          className="max-w-xs"
        />
        <Button type="submit" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Tag
        </Button>
      </form>

      <div className="space-y-2">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <div className="flex items-center gap-3">
              <Badge variant="secondary">{tag.name}</Badge>
              <span className="text-sm text-muted-foreground">
                {tag._count.posts} post{tag._count.posts !== 1 ? "s" : ""}
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
                  <AlertDialogTitle>Delete tag &quot;{tag.name}&quot;?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove the tag from all posts. Posts themselves will not be deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(tag.id, tag.name)}
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

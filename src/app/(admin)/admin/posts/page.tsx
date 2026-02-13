import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { RatingDisplay } from "@/components/posts/rating-display";
import { PostActions } from "@/components/admin/post-actions";

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
    include: { author: true },
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Posts</h1>
          <p className="text-muted-foreground">
            Manage your anime reviews.
          </p>
        </div>
        <Link href="/admin/posts/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Review
          </Button>
        </Link>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Anime</TableHead>
              <TableHead>Episode</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="font-medium hover:text-primary transition-colors"
                  >
                    {post.title}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {post.animeTitle}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {post.season} E{post.episodeNumber}
                </TableCell>
                <TableCell>
                  <RatingDisplay rating={post.rating} />
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      post.status === "PUBLISHED"
                        ? "default"
                        : post.status === "DRAFT"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {post.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(post.updatedAt)}
                </TableCell>
                <TableCell>
                  <PostActions postId={post.id} postStatus={post.status} />
                </TableCell>
              </TableRow>
            ))}
            {posts.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  No posts yet. Create your first review!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { DeleteCommentButton } from "@/components/admin/delete-comment-button";

export default async function AdminCommentsPage() {
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    include: { post: { select: { title: true, slug: true } } },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Comments</h1>
        <p className="text-muted-foreground">
          {comments.length} comment{comments.length !== 1 ? "s" : ""} total
        </p>
      </div>

      {comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="flex items-start justify-between gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{comment.authorName}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(comment.createdAt)}
                    </span>
                    {comment.parentId && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                        reply
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm">{comment.body}</p>
                  <Link
                    href={`/posts/${comment.post.slug}`}
                    className="mt-1 inline-block text-xs text-primary hover:underline"
                  >
                    on {comment.post.title}
                  </Link>
                </div>
                <DeleteCommentButton commentId={comment.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No comments yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

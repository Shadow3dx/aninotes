import Link from "next/link";
import { FileText, FilePen, Clock, Star, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default async function AdminDashboard() {
  const [publishedCount, draftCount, scheduledCount, posts, avgRating] =
    await Promise.all([
      prisma.post.count({ where: { status: "PUBLISHED" } }),
      prisma.post.count({ where: { status: "DRAFT" } }),
      prisma.post.count({ where: { status: "SCHEDULED" } }),
      prisma.post.findMany({
        orderBy: { updatedAt: "desc" },
        take: 5,
        include: { author: true },
      }),
      prisma.post.aggregate({ _avg: { rating: true } }),
    ]);

  const stats = [
    {
      label: "Published",
      value: publishedCount,
      icon: FileText,
      color: "text-green-500",
    },
    {
      label: "Drafts",
      value: draftCount,
      icon: FilePen,
      color: "text-yellow-500",
    },
    {
      label: "Scheduled",
      value: scheduledCount,
      icon: Clock,
      color: "text-blue-500",
    },
    {
      label: "Avg Rating",
      value: avgRating._avg.rating?.toFixed(1) ?? "—",
      icon: Star,
      color: "text-primary",
    },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to AniNotes.</p>
        </div>
        <Link href="/admin/posts/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Review
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent posts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Posts</CardTitle>
          <Link href="/admin/posts">
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/admin/posts/${post.id}/edit`}
                className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-accent"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{post.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {post.animeTitle} &middot;{" "}
                    {formatDate(post.updatedAt)}
                  </p>
                </div>
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
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateUserForm } from "@/components/admin/create-user-form";
import { DeleteUserButton } from "@/components/admin/delete-user-button";
import { formatDate } from "@/lib/utils";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { posts: true } } },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground">
          Manage who can access the admin dashboard and publish posts.
        </p>
      </div>

      {/* Existing users */}
      <div className="mb-8 space-y-3">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{user.name}</span>
                  {user.id === session.user!.id && (
                    <Badge variant="secondary" className="text-xs">You</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {user.email} &middot; @{user.username} &middot; {user._count.posts} post{user._count.posts !== 1 ? "s" : ""} &middot; Joined {formatDate(user.createdAt)}
                </p>
              </div>
              {user.id !== session.user!.id && (
                <DeleteUserButton userId={user.id} userName={user.name} />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create new user */}
      <CreateUserForm />
    </div>
  );
}

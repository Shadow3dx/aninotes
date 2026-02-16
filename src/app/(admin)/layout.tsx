import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || !["ADMIN", "EDITOR"].includes(user.role)) {
    redirect("/my-list");
  }

  return (
    <div className="flex h-screen">
      <AdminSidebar isAdmin={user?.role === "ADMIN"} />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}

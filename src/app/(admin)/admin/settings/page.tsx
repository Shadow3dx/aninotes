import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UpdateProfileForm } from "@/components/admin/update-profile-form";
import { ChangePasswordForm } from "@/components/admin/change-password-form";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true },
  });

  if (!user) redirect("/login");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile and account security.
        </p>
      </div>
      <div className="space-y-6">
        <UpdateProfileForm
          currentName={user.name}
          currentEmail={user.email}
        />
        <ChangePasswordForm />
      </div>
    </div>
  );
}

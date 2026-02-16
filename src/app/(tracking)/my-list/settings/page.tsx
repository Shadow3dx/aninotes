import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/layout/container";
import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";
import { PasswordSettingsForm } from "@/components/settings/password-settings-form";

export const metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, username: true, bio: true },
  });

  if (!user) redirect("/login");

  return (
    <Container className="py-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your profile and account settings.
          </p>
        </div>

        <ProfileSettingsForm
          name={user.name}
          email={user.email}
          username={user.username}
          bio={user.bio ?? ""}
        />

        <PasswordSettingsForm />
      </div>
    </Container>
  );
}

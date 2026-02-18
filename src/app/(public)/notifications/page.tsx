import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Container } from "@/components/layout/container";
import { NotificationList } from "@/components/notifications/notification-list";

export const metadata = {
  title: "Notifications",
};

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <Container className="py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold tracking-tight">Notifications</h1>
        <NotificationList />
      </div>
    </Container>
  );
}

import { ChangePasswordForm } from "@/components/admin/change-password-form";

export default function AdminSettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account security.</p>
      </div>
      <ChangePasswordForm />
    </div>
  );
}

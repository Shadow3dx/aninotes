"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { changePassword } from "@/actions/account";

export function ChangePasswordForm() {
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData(e.currentTarget);
      await changePassword(formData);
      toast.success("Password changed successfully!");
      e.currentTarget.reset();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to change password"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Change Password
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              minLength={8}
              required
            />
            <p className="text-xs text-muted-foreground">
              Minimum 8 characters
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
            />
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? "Changing..." : "Change Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

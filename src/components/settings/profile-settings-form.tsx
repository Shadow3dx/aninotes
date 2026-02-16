"use client";

import { useState } from "react";
import { toast } from "sonner";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateProfile } from "@/actions/account";

interface ProfileSettingsFormProps {
  name: string;
  email: string;
  username: string;
  bio: string;
}

export function ProfileSettingsForm({
  name: initialName,
  email: initialEmail,
  username: initialUsername,
  bio: initialBio,
}: ProfileSettingsFormProps) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [username, setUsername] = useState(initialUsername);
  const [bio, setBio] = useState(initialBio);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("email", email);
      formData.set("username", username);
      formData.set("bio", bio);
      await updateProfile(formData);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your public name"
              required
            />
            <p className="text-xs text-muted-foreground">
              Shown on your posts and profile
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your-username"
              required
              minLength={3}
              maxLength={30}
              pattern="^[a-zA-Z0-9_-]+$"
            />
            <p className="text-xs text-muted-foreground">
              Used for your profile URL. Letters, numbers, hyphens, and underscores only.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <p className="text-xs text-muted-foreground">
              Used to sign in to your account
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people a little about yourself..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {bio.length}/500 characters. Shown on your public profile.
            </p>
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

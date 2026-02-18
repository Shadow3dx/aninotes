"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters").max(30).regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, hyphens, and underscores"),
  bio: z.string().max(500).optional().default(""),
  image: z.string().url("Invalid URL").max(500).optional().or(z.literal("")),
});

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const data = updateProfileSchema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
    username: formData.get("username"),
    bio: formData.get("bio") || "",
    image: formData.get("image") || "",
  });

  // Check if email is taken by another user
  const existingEmail = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existingEmail && existingEmail.id !== session.user.id) {
    throw new Error("Email is already taken");
  }

  // Check if username is taken by another user
  const existingUsername = await prisma.user.findUnique({
    where: { username: data.username },
  });
  if (existingUsername && existingUsername.id !== session.user.id) {
    throw new Error("Username is already taken");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: data.name, email: data.email, username: data.username, bio: data.bio, image: data.image || null },
  });

  revalidatePath("/admin");
  revalidatePath(`/profile/${data.username}`);
  revalidatePath("/my-list/settings");
  return { success: true };
}

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function changePassword(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const data = changePasswordSchema.parse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) throw new Error("User not found");

  const isValid = await bcrypt.compare(data.currentPassword, user.passwordHash);
  if (!isValid) throw new Error("Current password is incorrect");

  const newHash = await bcrypt.hash(data.newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  revalidatePath("/admin");
  return { success: true };
}

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") throw new Error("Admin access required");
  return session;
}

export async function createUser(formData: FormData) {
  await requireAdmin();

  const data = createUserSchema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
    username: formData.get("username"),
    password: formData.get("password"),
  });

  const existingEmail = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existingEmail) throw new Error("Email is already taken");

  const existingUsername = await prisma.user.findUnique({
    where: { username: data.username },
  });
  if (existingUsername) throw new Error("Username is already taken");

  const passwordHash = await bcrypt.hash(data.password, 12);

  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      username: data.username,
      passwordHash,
    },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function deleteUser(userId: string) {
  const session = await requireAdmin();

  if (userId === session.user!.id) {
    throw new Error("You cannot delete your own account");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  await prisma.user.delete({ where: { id: userId } });

  revalidatePath("/admin/users");
  return { success: true };
}

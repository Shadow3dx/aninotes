"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

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

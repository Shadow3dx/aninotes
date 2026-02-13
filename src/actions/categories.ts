"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { categorySchema } from "@/lib/validations/tag";
import { slugify } from "@/lib/utils";

export async function createCategory(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const data = categorySchema.parse({ name: formData.get("name") });
  const slug = slugify(data.name);

  await prisma.category.create({
    data: { name: data.name, slug },
  });

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.category.delete({ where: { id } });

  revalidatePath("/admin/categories");
  return { success: true };
}

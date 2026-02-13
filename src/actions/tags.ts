"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { tagSchema } from "@/lib/validations/tag";
import { slugify } from "@/lib/utils";

export async function createTag(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const data = tagSchema.parse({ name: formData.get("name") });
  const slug = slugify(data.name);

  await prisma.tag.create({
    data: { name: data.name, slug },
  });

  revalidatePath("/admin/tags");
  return { success: true };
}

export async function deleteTag(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.tag.delete({ where: { id } });

  revalidatePath("/admin/tags");
  return { success: true };
}

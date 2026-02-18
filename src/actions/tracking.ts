"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { animeEntrySchema, mangaEntrySchema } from "@/lib/validations/tracking";

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session;
}

// --- Anime Entry Actions ---

export async function addAnimeEntry(formData: FormData) {
  const session = await requireAuth();
  const raw = Object.fromEntries(formData.entries());
  const data = animeEntrySchema.parse(raw);

  const existing = await prisma.animeEntry.findUnique({
    where: { userId_malId: { userId: session.user.id, malId: data.malId } },
  });
  if (existing) throw new Error("This anime is already in your list");

  await prisma.animeEntry.create({
    data: {
      userId: session.user.id,
      malId: data.malId,
      title: data.title,
      imageUrl: data.imageUrl || null,
      synopsis: data.synopsis || null,
      totalEpisodes: data.totalEpisodes ?? null,
      mediaType: data.mediaType || null,
      airingStatus: data.airingStatus || null,
      malScore: data.malScore ?? null,
      status: data.status,
      score: data.score ?? null,
      episodesWatched: data.episodesWatched,
      notes: data.notes || null,
    },
  });

  revalidatePath("/my-list");
  return { success: true };
}

export async function updateAnimeEntry(id: string, formData: FormData) {
  const session = await requireAuth();

  const entry = await prisma.animeEntry.findUnique({ where: { id } });
  if (!entry || entry.userId !== session.user.id) throw new Error("Not found");

  const raw = Object.fromEntries(formData.entries());
  const data = animeEntrySchema.partial().parse(raw);

  // Log history if episodesWatched changed
  if (data.episodesWatched !== undefined && data.episodesWatched !== entry.episodesWatched) {
    await prisma.entryHistory.create({
      data: {
        userId: session.user.id,
        entryType: "ANIME",
        entryTitle: entry.title,
        field: "episodesWatched",
        oldValue: entry.episodesWatched,
        newValue: data.episodesWatched,
      },
    });
  }

  await prisma.animeEntry.update({
    where: { id },
    data: {
      ...(data.status !== undefined && { status: data.status }),
      ...(data.score !== undefined && { score: data.score ?? null }),
      ...(data.episodesWatched !== undefined && {
        episodesWatched: data.episodesWatched,
      }),
      ...(data.notes !== undefined && { notes: data.notes || null }),
    },
  });

  revalidatePath("/my-list");
  return { success: true };
}

export async function deleteAnimeEntry(id: string) {
  const session = await requireAuth();

  const entry = await prisma.animeEntry.findUnique({ where: { id } });
  if (!entry || entry.userId !== session.user.id) throw new Error("Not found");

  await prisma.animeEntry.delete({ where: { id } });

  revalidatePath("/my-list");
  return { success: true };
}

// --- Manga Entry Actions ---

export async function addMangaEntry(formData: FormData) {
  const session = await requireAuth();
  const raw = Object.fromEntries(formData.entries());
  const data = mangaEntrySchema.parse(raw);

  const existing = await prisma.mangaEntry.findUnique({
    where: { userId_malId: { userId: session.user.id, malId: data.malId } },
  });
  if (existing) throw new Error("This manga is already in your list");

  await prisma.mangaEntry.create({
    data: {
      userId: session.user.id,
      malId: data.malId,
      title: data.title,
      imageUrl: data.imageUrl || null,
      synopsis: data.synopsis || null,
      totalChapters: data.totalChapters ?? null,
      totalVolumes: data.totalVolumes ?? null,
      mediaType: data.mediaType || null,
      publishingStatus: data.publishingStatus || null,
      malScore: data.malScore ?? null,
      status: data.status,
      score: data.score ?? null,
      chaptersRead: data.chaptersRead,
      volumesRead: data.volumesRead,
      notes: data.notes || null,
    },
  });

  revalidatePath("/my-list");
  return { success: true };
}

export async function updateMangaEntry(id: string, formData: FormData) {
  const session = await requireAuth();

  const entry = await prisma.mangaEntry.findUnique({ where: { id } });
  if (!entry || entry.userId !== session.user.id) throw new Error("Not found");

  const raw = Object.fromEntries(formData.entries());
  const data = mangaEntrySchema.partial().parse(raw);

  // Log history if chaptersRead or volumesRead changed
  const historyPromises: Promise<unknown>[] = [];
  if (data.chaptersRead !== undefined && data.chaptersRead !== entry.chaptersRead) {
    historyPromises.push(
      prisma.entryHistory.create({
        data: {
          userId: session.user.id,
          entryType: "MANGA",
          entryTitle: entry.title,
          field: "chaptersRead",
          oldValue: entry.chaptersRead,
          newValue: data.chaptersRead,
        },
      })
    );
  }
  if (data.volumesRead !== undefined && data.volumesRead !== entry.volumesRead) {
    historyPromises.push(
      prisma.entryHistory.create({
        data: {
          userId: session.user.id,
          entryType: "MANGA",
          entryTitle: entry.title,
          field: "volumesRead",
          oldValue: entry.volumesRead,
          newValue: data.volumesRead,
        },
      })
    );
  }
  if (historyPromises.length > 0) {
    await Promise.all(historyPromises);
  }

  await prisma.mangaEntry.update({
    where: { id },
    data: {
      ...(data.status !== undefined && { status: data.status }),
      ...(data.score !== undefined && { score: data.score ?? null }),
      ...(data.chaptersRead !== undefined && {
        chaptersRead: data.chaptersRead,
      }),
      ...(data.volumesRead !== undefined && { volumesRead: data.volumesRead }),
      ...(data.notes !== undefined && { notes: data.notes || null }),
    },
  });

  revalidatePath("/my-list");
  return { success: true };
}

export async function deleteMangaEntry(id: string) {
  const session = await requireAuth();

  const entry = await prisma.mangaEntry.findUnique({ where: { id } });
  if (!entry || entry.userId !== session.user.id) throw new Error("Not found");

  await prisma.mangaEntry.delete({ where: { id } });

  revalidatePath("/my-list");
  return { success: true };
}

// --- Favorite Toggle Actions ---

export async function toggleAnimeFavorite(id: string) {
  const session = await requireAuth();

  const entry = await prisma.animeEntry.findUnique({ where: { id } });
  if (!entry || entry.userId !== session.user.id) throw new Error("Not found");

  if (!entry.isFavorite) {
    const [animeCount, mangaCount] = await Promise.all([
      prisma.animeEntry.count({ where: { userId: session.user.id, isFavorite: true } }),
      prisma.mangaEntry.count({ where: { userId: session.user.id, isFavorite: true } }),
    ]);
    if (animeCount + mangaCount >= 6) throw new Error("Maximum 6 favorites allowed");
  }

  await prisma.animeEntry.update({
    where: { id },
    data: { isFavorite: !entry.isFavorite },
  });

  revalidatePath("/my-list");
  return { success: true, isFavorite: !entry.isFavorite };
}

export async function toggleMangaFavorite(id: string) {
  const session = await requireAuth();

  const entry = await prisma.mangaEntry.findUnique({ where: { id } });
  if (!entry || entry.userId !== session.user.id) throw new Error("Not found");

  if (!entry.isFavorite) {
    const [animeCount, mangaCount] = await Promise.all([
      prisma.animeEntry.count({ where: { userId: session.user.id, isFavorite: true } }),
      prisma.mangaEntry.count({ where: { userId: session.user.id, isFavorite: true } }),
    ]);
    if (animeCount + mangaCount >= 6) throw new Error("Maximum 6 favorites allowed");
  }

  await prisma.mangaEntry.update({
    where: { id },
    data: { isFavorite: !entry.isFavorite },
  });

  revalidatePath("/my-list");
  return { success: true, isFavorite: !entry.isFavorite };
}

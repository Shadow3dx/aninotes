import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/layout/container";
import { JikanSearchPage } from "@/components/tracking/jikan-search-page";

export const metadata = { title: "Search Anime & Manga | AniNotes" };

export default async function SearchPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [existingAnime, existingManga] = await Promise.all([
    prisma.animeEntry.findMany({
      where: { userId: session.user.id },
      select: { malId: true },
    }),
    prisma.mangaEntry.findMany({
      where: { userId: session.user.id },
      select: { malId: true },
    }),
  ]);

  return (
    <Container className="py-8">
      <JikanSearchPage
        existingAnimeIds={existingAnime.map((e) => e.malId)}
        existingMangaIds={existingManga.map((e) => e.malId)}
      />
    </Container>
  );
}

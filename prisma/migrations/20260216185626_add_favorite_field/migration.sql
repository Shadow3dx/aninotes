-- AlterTable
ALTER TABLE "AnimeEntry" ADD COLUMN     "isFavorite" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "MangaEntry" ADD COLUMN     "isFavorite" BOOLEAN NOT NULL DEFAULT false;

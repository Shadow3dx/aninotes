-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "chapterNumber" INTEGER,
ADD COLUMN     "mangaTitle" TEXT,
ADD COLUMN     "reviewType" TEXT NOT NULL DEFAULT 'ANIME',
ALTER COLUMN "animeTitle" DROP NOT NULL,
ALTER COLUMN "episodeNumber" DROP NOT NULL,
ALTER COLUMN "season" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Post_reviewType_idx" ON "Post"("reviewType");

-- CreateTable
CREATE TABLE "AnimeEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "malId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT,
    "synopsis" TEXT,
    "totalEpisodes" INTEGER,
    "mediaType" TEXT,
    "airingStatus" TEXT,
    "malScore" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'PLAN_TO_WATCH',
    "score" INTEGER,
    "episodesWatched" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnimeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MangaEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "malId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT,
    "synopsis" TEXT,
    "totalChapters" INTEGER,
    "totalVolumes" INTEGER,
    "mediaType" TEXT,
    "publishingStatus" TEXT,
    "malScore" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'PLAN_TO_READ',
    "score" INTEGER,
    "chaptersRead" INTEGER NOT NULL DEFAULT 0,
    "volumesRead" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MangaEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnimeEntry_userId_idx" ON "AnimeEntry"("userId");

-- CreateIndex
CREATE INDEX "AnimeEntry_userId_status_idx" ON "AnimeEntry"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AnimeEntry_userId_malId_key" ON "AnimeEntry"("userId", "malId");

-- CreateIndex
CREATE INDEX "MangaEntry_userId_idx" ON "MangaEntry"("userId");

-- CreateIndex
CREATE INDEX "MangaEntry_userId_status_idx" ON "MangaEntry"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "MangaEntry_userId_malId_key" ON "MangaEntry"("userId", "malId");

-- AddForeignKey
ALTER TABLE "AnimeEntry" ADD CONSTRAINT "AnimeEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MangaEntry" ADD CONSTRAINT "MangaEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "SlotType" AS ENUM ('SCENE', 'CHARACTER');

-- CreateEnum
CREATE TYPE "EndingType" AS ENUM ('CORRECT', 'INCORRECT');

-- CreateTable
CREATE TABLE "levels" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "narrative" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scenes" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "scenes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "characters" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "level_items" (
    "id" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "sceneId" TEXT,
    "characterId" TEXT,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "level_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scene_slots" (
    "id" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "scene_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_slots" (
    "id" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "anchorX" DOUBLE PRECISION NOT NULL,
    "anchorY" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "character_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expected_placements" (
    "id" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "slotType" "SlotType" NOT NULL,
    "slotKey" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "expected_placements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "endings" (
    "id" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "type" "EndingType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageAssetId" TEXT,

    CONSTRAINT "endings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attempts" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attempt_items" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "slotType" "SlotType" NOT NULL,
    "slotKey" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "attempt_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "level_items_levelId_idx" ON "level_items"("levelId");

-- CreateIndex
CREATE INDEX "level_items_sceneId_idx" ON "level_items"("sceneId");

-- CreateIndex
CREATE INDEX "level_items_characterId_idx" ON "level_items"("characterId");

-- CreateIndex
CREATE INDEX "scene_slots_levelId_idx" ON "scene_slots"("levelId");

-- CreateIndex
CREATE INDEX "character_slots_sceneId_idx" ON "character_slots"("sceneId");

-- CreateIndex
CREATE INDEX "expected_placements_levelId_idx" ON "expected_placements"("levelId");

-- CreateIndex
CREATE UNIQUE INDEX "expected_placements_levelId_slotType_slotKey_key" ON "expected_placements"("levelId", "slotType", "slotKey");

-- CreateIndex
CREATE INDEX "endings_levelId_idx" ON "endings"("levelId");

-- CreateIndex
CREATE UNIQUE INDEX "game_sessions_sessionToken_key" ON "game_sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "attempts_levelId_idx" ON "attempts"("levelId");

-- CreateIndex
CREATE UNIQUE INDEX "attempts_sessionId_levelId_attemptNumber_key" ON "attempts"("sessionId", "levelId", "attemptNumber");

-- CreateIndex
CREATE INDEX "attempt_items_attemptId_idx" ON "attempt_items"("attemptId");

-- AddForeignKey
ALTER TABLE "level_items" ADD CONSTRAINT "level_items_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "level_items" ADD CONSTRAINT "level_items_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "scenes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "level_items" ADD CONSTRAINT "level_items_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scene_slots" ADD CONSTRAINT "scene_slots_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_slots" ADD CONSTRAINT "character_slots_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "scenes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expected_placements" ADD CONSTRAINT "expected_placements_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "endings" ADD CONSTRAINT "endings_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "game_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempt_items" ADD CONSTRAINT "attempt_items_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

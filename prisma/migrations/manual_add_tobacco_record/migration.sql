-- CreateTable
CREATE TABLE "TobaccoRecord" (
    "id" SERIAL NOT NULL,
    "brand" TEXT NOT NULL,
    "weight" TEXT,
    "awakingTime" TEXT,
    "pipeType" TEXT,
    "temperature" TEXT,
    "humidity" TEXT,
    "fillQuality" TEXT,
    "drawQuality" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TobaccoRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TobaccoRecord_createdAt_idx" ON "TobaccoRecord"("createdAt");

-- CreateEnum
CREATE TYPE "ItemCondition" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR');

-- CreateEnum
CREATE TYPE "Recommendation" AS ENUM ('SELL', 'DONATE', 'RECYCLE', 'DISPOSE');

-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('TODO', 'SOLD', 'DONATED', 'RECYCLED', 'TRASHED');

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "identifiedName" TEXT NOT NULL,
    "userOverrideName" TEXT,
    "condition" "ItemCondition" NOT NULL,
    "recommendation" "Recommendation" NOT NULL,
    "reasoning" TEXT NOT NULL,
    "estimatedValueLow" INTEGER,
    "estimatedValueHigh" INTEGER,
    "guidance" TEXT NOT NULL,
    "isHazardous" BOOLEAN NOT NULL DEFAULT false,
    "hazardWarning" TEXT,
    "status" "ItemStatus" NOT NULL DEFAULT 'TODO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Item_userId_idx" ON "Item"("userId");

-- CreateIndex
CREATE INDEX "Item_userId_status_idx" ON "Item"("userId", "status");

-- CreateIndex
CREATE INDEX "Item_createdAt_idx" ON "Item"("createdAt");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


/*
  Warnings:

  - A unique constraint covering the columns `[lastCommitId]` on the table `Project` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "lastCommitId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Project_lastCommitId_key" ON "Project"("lastCommitId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_lastCommitId_fkey" FOREIGN KEY ("lastCommitId") REFERENCES "Commit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

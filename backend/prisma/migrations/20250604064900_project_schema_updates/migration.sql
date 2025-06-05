-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "pinned" BOOLEAN NOT NULL DEFAULT false;

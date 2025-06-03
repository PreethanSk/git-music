-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO', 'TEAM');

-- CreateEnum
CREATE TYPE "LoginMethod" AS ENUM ('PASSWORD', 'GOOGLE', 'APPLE', 'GITHUB');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "loginMethod" "LoginMethod",
ADD COLUMN     "pfpUrl" TEXT,
ADD COLUMN     "plan" "Plan" NOT NULL DEFAULT 'FREE';

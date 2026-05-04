/*
  Warnings:

  - The `status` column on the `companies` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `jobs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[userId]` on the table `company_members` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE', 'LOCKED', 'PENDING', 'SUSPENDED');

-- DropIndex
DROP INDEX "company_members_userId_companyId_key";

-- AlterTable
ALTER TABLE "companies" DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "jobs" DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE UNIQUE INDEX "company_members_userId_key" ON "company_members"("userId");

/*
  Warnings:

  - The values [SHORTLISTED,INTERVIEWED,WITHDRAWN] on the enum `AppStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [APPLICATION_STATUS,NEW_JOB_MATCH,MESSAGE,SYSTEM] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `salaryId` on the `jobs` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[jobId]` on the table `salaries` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `jobId` to the `salaries` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AppStatus_new" AS ENUM ('PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED', 'CANCELLED');
ALTER TABLE "applications" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "applications" ALTER COLUMN "status" TYPE "AppStatus_new" USING ("status"::text::"AppStatus_new");
ALTER TYPE "AppStatus" RENAME TO "AppStatus_old";
ALTER TYPE "AppStatus_new" RENAME TO "AppStatus";
DROP TYPE "AppStatus_old";
ALTER TABLE "applications" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('APPLICATION_RECEIVED', 'APPLICATION_STATUS_CHANGED', 'COMPANY_REGISTRATION', 'COMPANY_APPROVED', 'COMPANY_REJECTED', 'COMPANY_UPDATE_PENDING', 'COMPANY_INVITATION', 'MEMBER_JOINED', 'MEMBER_REMOVED', 'JOB_POSTED', 'JOB_APPROVED', 'JOB_REJECTED', 'JOB_UPDATE_PENDING', 'WELCOME');
ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "NotificationType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "jobs" DROP CONSTRAINT "jobs_salaryId_fkey";

-- DropIndex
DROP INDEX "jobs_salaryId_key";

-- AlterTable
ALTER TABLE "company_members" ALTER COLUMN "companyRole" SET DEFAULT 'RECRUITER';

-- AlterTable
ALTER TABLE "jobs" DROP COLUMN "salaryId";

-- AlterTable
ALTER TABLE "salaries" ADD COLUMN     "jobId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "salaries_jobId_key" ON "salaries"("jobId");

-- AddForeignKey
ALTER TABLE "salaries" ADD CONSTRAINT "salaries_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

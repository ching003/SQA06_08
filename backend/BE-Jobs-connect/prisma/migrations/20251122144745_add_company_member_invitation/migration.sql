/*
  Warnings:

  - The values [CANCELLED] on the enum `AppStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [APPLICATION_RECEIVED,APPLICATION_STATUS_CHANGED,MEMBER_REMOVED,JOB_POSTED,JOB_APPROVED,JOB_REJECTED,JOB_UPDATE_PENDING,WELCOME] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'EXPIRED');

-- AlterEnum
BEGIN;
CREATE TYPE "AppStatus_new" AS ENUM ('PENDING', 'REVIEWING', 'SHORTLISTED', 'INTERVIEWED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');
ALTER TABLE "applications" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "applications" ALTER COLUMN "status" TYPE "AppStatus_new" USING ("status"::text::"AppStatus_new");
ALTER TYPE "AppStatus" RENAME TO "AppStatus_old";
ALTER TYPE "AppStatus_new" RENAME TO "AppStatus";
DROP TYPE "AppStatus_old";
ALTER TABLE "applications" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('APPLICATION_STATUS', 'NEW_JOB_MATCH', 'MESSAGE', 'SYSTEM', 'COMPANY_INVITATION', 'COMPANY_REGISTRATION', 'COMPANY_APPROVED', 'COMPANY_REJECTED', 'COMPANY_UPDATE_PENDING', 'MEMBER_JOINED');
ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "NotificationType_old";
COMMIT;

-- AlterTable
ALTER TABLE "company_members" ALTER COLUMN "companyRole" DROP DEFAULT;

-- CreateTable
CREATE TABLE "company_member_invitations" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,
    "role" "CompanyRole" NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3),
    "notificationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_member_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "company_member_invitations_notificationId_key" ON "company_member_invitations"("notificationId");

-- CreateIndex
CREATE UNIQUE INDEX "company_member_invitations_companyId_userId_status_key" ON "company_member_invitations"("companyId", "userId", "status");

-- AddForeignKey
ALTER TABLE "company_member_invitations" ADD CONSTRAINT "company_member_invitations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_member_invitations" ADD CONSTRAINT "company_member_invitations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_member_invitations" ADD CONSTRAINT "company_member_invitations_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_member_invitations" ADD CONSTRAINT "company_member_invitations_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "notifications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

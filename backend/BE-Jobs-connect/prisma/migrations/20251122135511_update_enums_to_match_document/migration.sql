/*
  Warnings:

  - The values [SHORTLISTED,INTERVIEWED,WITHDRAWN] on the enum `AppStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [APPLICATION_STATUS,NEW_JOB_MATCH,MESSAGE,SYSTEM] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.

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

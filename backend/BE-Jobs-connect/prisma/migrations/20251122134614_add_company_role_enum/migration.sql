/*
  Warnings:

  - The `companyRole` column on the `company_members` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "CompanyRole" AS ENUM ('OWNER', 'MANAGER', 'RECRUITER', 'VIEWER');

-- AlterTable
ALTER TABLE "company_members" DROP COLUMN "companyRole",
ADD COLUMN     "companyRole" "CompanyRole" NOT NULL DEFAULT 'RECRUITER';

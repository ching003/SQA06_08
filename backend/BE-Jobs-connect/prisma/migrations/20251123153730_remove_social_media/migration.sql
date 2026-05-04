/*
  Warnings:

  - You are about to drop the `social_medias` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "social_medias" DROP CONSTRAINT "social_medias_companyId_fkey";

-- DropForeignKey
ALTER TABLE "social_medias" DROP CONSTRAINT "social_medias_userId_fkey";

-- DropTable
DROP TABLE "social_medias";

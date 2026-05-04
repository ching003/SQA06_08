/*
  Warnings:

  - You are about to drop the column `embedding` on the `cvs` table. All the data in the column will be lost.
  - You are about to drop the column `embedding` on the `jobs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cvs" DROP COLUMN "embedding",
ADD COLUMN     "contentHash" TEXT,
ADD COLUMN     "experienceEmbedding" JSONB,
ADD COLUMN     "skillsEmbedding" JSONB,
ADD COLUMN     "titleEmbedding" JSONB;

-- AlterTable
ALTER TABLE "jobs" DROP COLUMN "embedding",
ADD COLUMN     "contentHash" TEXT,
ADD COLUMN     "requirementEmbedding" JSONB,
ADD COLUMN     "skillsEmbedding" JSONB,
ADD COLUMN     "titleEmbedding" JSONB;

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "readAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "job_skills" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "skillName" TEXT NOT NULL,
    "level" "SkillLevel" NOT NULL,
    "yearsOfExperience" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_skills_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "job_skills" ADD CONSTRAINT "job_skills_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

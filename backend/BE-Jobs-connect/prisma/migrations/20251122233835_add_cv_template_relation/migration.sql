-- AlterTable
ALTER TABLE "cvs" ADD COLUMN "templateId" TEXT;

-- AddForeignKey
ALTER TABLE "cvs" ADD CONSTRAINT "cvs_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "cv_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;


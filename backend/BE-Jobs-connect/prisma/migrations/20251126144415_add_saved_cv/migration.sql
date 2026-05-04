-- CreateTable
CREATE TABLE "saved_cvs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cvId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_cvs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "saved_cvs_userId_cvId_key" ON "saved_cvs"("userId", "cvId");

-- AddForeignKey
ALTER TABLE "saved_cvs" ADD CONSTRAINT "saved_cvs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_cvs" ADD CONSTRAINT "saved_cvs_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "cvs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

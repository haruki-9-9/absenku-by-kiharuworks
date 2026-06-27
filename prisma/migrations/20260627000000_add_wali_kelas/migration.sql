-- CreateTable
CREATE TABLE "wali_kelas" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kelasId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wali_kelas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wali_kelas_userId_key" ON "wali_kelas"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "wali_kelas_kelasId_key" ON "wali_kelas"("kelasId");

-- AddForeignKey
ALTER TABLE "wali_kelas" ADD CONSTRAINT "wali_kelas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wali_kelas" ADD CONSTRAINT "wali_kelas_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "kelas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

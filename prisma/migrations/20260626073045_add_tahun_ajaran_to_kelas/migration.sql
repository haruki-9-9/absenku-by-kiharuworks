/*
  Warnings:

  - A unique constraint covering the columns `[sekolahId,tahunAjaranId,nama]` on the table `kelas` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tahunAjaranId` to the `kelas` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "kelas_sekolahId_nama_key";

-- AlterTable
ALTER TABLE "kelas" ADD COLUMN     "tahunAjaranId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "kelas_sekolahId_tahunAjaranId_nama_key" ON "kelas"("sekolahId", "tahunAjaranId", "nama");

-- AddForeignKey
ALTER TABLE "kelas" ADD CONSTRAINT "kelas_tahunAjaranId_fkey" FOREIGN KEY ("tahunAjaranId") REFERENCES "tahun_ajaran"("id") ON DELETE CASCADE ON UPDATE CASCADE;

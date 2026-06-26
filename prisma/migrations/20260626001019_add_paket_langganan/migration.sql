-- CreateEnum
CREATE TYPE "PaketLangganan" AS ENUM ('STARTER', 'BASIC', 'PRO', 'ENTERPRISE');

-- AlterTable
ALTER TABLE "langganan" ADD COLUMN     "maxKelas" INTEGER NOT NULL DEFAULT 6,
ADD COLUMN     "paket" "PaketLangganan" NOT NULL DEFAULT 'STARTER';

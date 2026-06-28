-- CreateTable: login_attempt (sebelumnya sudah dipakai di kode tapi belum punya migrasi)
CREATE TABLE IF NOT EXISTS "login_attempt" (
    "id"        TEXT NOT NULL,
    "email"     TEXT NOT NULL,
    "ip"        TEXT NOT NULL,
    "success"   BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_attempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "login_attempt_email_createdAt_idx" ON "login_attempt"("email", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "login_attempt_ip_createdAt_idx" ON "login_attempt"("ip", "createdAt");

-- AlterTable: tambah sessionVersion ke user (untuk JWT versioning, ganti fetch internal di middleware)
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "sessionVersion" INTEGER NOT NULL DEFAULT 0;

-- CreateTable: log_absensi (audit trail perubahan absensi)
CREATE TABLE "log_absensi" (
    "id"             TEXT NOT NULL,
    "sekolahId"      TEXT NOT NULL,
    "absensiId"      TEXT NOT NULL,
    "siswaId"        TEXT NOT NULL,
    "tanggal"        DATE NOT NULL,
    "statusLama"     "StatusAbsensi",
    "statusBaru"     "StatusAbsensi" NOT NULL,
    "keteranganLama" TEXT,
    "keteranganBaru" TEXT,
    "diubahOleh"     TEXT NOT NULL,
    "diubahOlehNama" TEXT NOT NULL,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_absensi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "log_absensi_sekolahId_tanggal_idx" ON "log_absensi"("sekolahId", "tanggal");

-- CreateIndex
CREATE INDEX "log_absensi_absensiId_idx" ON "log_absensi"("absensiId");

-- CreateIndex
CREATE INDEX "log_absensi_siswaId_tanggal_idx" ON "log_absensi"("siswaId", "tanggal");

"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { isJamLockTerlewati, getTanggalHariIni } from "@/lib/sekretaris/check-jam-lock";
import { revalidatePath } from "next/cache";

type StatusAbsensi = "H" | "S" | "I" | "A";

type ActionResult = { success: boolean; message: string };

const MAX_KETERANGAN_LENGTH = 200;

function sanitizeKeterangan(input: string): string {
  return input
    // hapus control characters (termasuk \n\r berlebih) selain spasi biasa
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, MAX_KETERANGAN_LENGTH);
}

/**
 * Set/update status absensi 1 siswa untuk hari ini.
 * Hanya bisa dipanggil oleh SEKRETARIS yang ditugaskan ke kelas siswa tsb,
 * dan hanya sebelum jam lock terlewati.
 */
export async function setStatusAbsensiAction(
  siswaId: string,
  status: StatusAbsensi,
  keterangan?: string
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "SEKRETARIS" || !user.sekolahId) {
    return { success: false, message: "Tidak terautentikasi." };
  }

  const sekretaris = await prisma.sekretaris.findUnique({
    where: { userId: user.id },
    select: { kelasId: true },
  });
  if (!sekretaris) {
    return { success: false, message: "Akun ini belum ditugaskan ke kelas manapun." };
  }

  // Pastikan siswa benar-benar berada di kelas sekretaris ini (aktif)
  const siswaKelas = await prisma.siswaKelas.findFirst({
    where: { siswaId, kelasId: sekretaris.kelasId, tanggalKeluar: null },
  });
  if (!siswaKelas) {
    return { success: false, message: "Siswa tidak ditemukan di kelas Anda." };
  }

  const konfigurasi = await prisma.konfigurasiSekolah.findUnique({
    where: { sekolahId: user.sekolahId },
  });
  const jamLock = konfigurasi?.jamLock ?? "15:00";
  const zonaWaktu = konfigurasi?.zonaWaktu ?? "Asia/Jakarta";

  if (isJamLockTerlewati(jamLock, zonaWaktu)) {
    return { success: false, message: "Sudah melewati jam lock, absensi tidak bisa diubah lagi." };
  }

  const tanggalHariIni = getTanggalHariIni(zonaWaktu);
  const keteranganBersih =
    status === "H" ? null : (keterangan ? sanitizeKeterangan(keterangan) || null : null);

  try {
    const existing = await prisma.absensi.findUnique({
      where: { siswaId_tanggal: { siswaId, tanggal: tanggalHariIni } },
      select: { id: true, status: true, keterangan: true },
    });

    const saved = await prisma.absensi.upsert({
      where: { siswaId_tanggal: { siswaId, tanggal: tanggalHariIni } },
      update: { status, keterangan: keteranganBersih, inputOleh: user.id },
      create: {
        sekolahId: user.sekolahId,
        kelasId: sekretaris.kelasId,
        siswaId,
        tanggal: tanggalHariIni,
        status,
        keterangan: keteranganBersih,
        inputOleh: user.id,
      },
    });

    // Audit log — hanya catat kalau benar-benar ada perubahan
    const adaPerubahan =
      !existing || existing.status !== status || existing.keterangan !== keteranganBersih;

    if (adaPerubahan) {
      await prisma.logAbsensi.create({
        data: {
          sekolahId: user.sekolahId,
          absensiId: saved.id,
          siswaId,
          tanggal: tanggalHariIni,
          statusLama: existing?.status ?? null,
          statusBaru: status,
          keteranganLama: existing?.keterangan ?? null,
          keteranganBaru: keteranganBersih,
          diubahOleh: user.id,
          diubahOlehNama: user.name,
        },
      }).catch((err) => console.error("Gagal mencatat log absensi:", err));
    }
  } catch (error) {
    console.error(error);
    return { success: false, message: "Gagal menyimpan absensi." };
  }

  revalidatePath("/sekretaris");
  return { success: true, message: "Absensi tersimpan." };
}

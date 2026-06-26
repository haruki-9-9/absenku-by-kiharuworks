"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export async function simpanKonfigurasiAction(
  _prevState: { success: boolean; message: string },
  formData: FormData
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN_SEKOLAH" || !user.sekolahId) {
    return { success: false, message: "Tidak terautentikasi." };
  }

  const jamLock = String(formData.get("jamLock") || "").trim();
  const batasAlpaStr = String(formData.get("batasAlpa") || "").trim();
  const zonaWaktu = String(formData.get("zonaWaktu") || "").trim();

  if (!jamLock || !batasAlpaStr || !zonaWaktu) {
    return { success: false, message: "Semua field wajib diisi." };
  }

  const batasAlpa = parseInt(batasAlpaStr, 10);
  if (isNaN(batasAlpa) || batasAlpa < 1 || batasAlpa > 99) {
    return { success: false, message: "Batas alpa harus antara 1 sampai 99." };
  }

  // Validasi format jam HH:MM
  const jamRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!jamRegex.test(jamLock)) {
    return { success: false, message: "Format jam lock tidak valid. Gunakan format HH:MM." };
  }

  try {
    await prisma.konfigurasiSekolah.update({
      where: { sekolahId: user.sekolahId },
      data: { jamLock, batasAlpa, zonaWaktu },
    });

    return { success: true, message: "Konfigurasi berhasil disimpan." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Terjadi kesalahan, coba lagi." };
  }
}

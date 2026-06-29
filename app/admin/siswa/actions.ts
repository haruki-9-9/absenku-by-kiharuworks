"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { revalidatePath } from "next/cache";

export async function tambahSiswaAction(
  _prevState: { success: boolean; message: string },
  formData: FormData
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN_SEKOLAH" || !user.sekolahId) {
    return { success: false, message: "Tidak terautentikasi." };
  }

  const nama = String(formData.get("nama") || "").trim();
  const nis = String(formData.get("nis") || "").trim();
  const jenisKelamin = String(formData.get("jenisKelamin") || "").trim();
  const kelasId = String(formData.get("kelasId") || "").trim();

  if (!nama || !nis || !jenisKelamin || !kelasId) {
    return { success: false, message: "Semua field wajib diisi." };
  }

  if (!["L", "P"].includes(jenisKelamin)) {
    return { success: false, message: "Jenis kelamin tidak valid." };
  }

  // Pastikan kelas milik sekolah ini
  const kelas = await prisma.kelas.findFirst({
    where: { id: kelasId, sekolahId: user.sekolahId, isActive: true },
  });
  if (!kelas) {
    return { success: false, message: "Kelas tidak valid." };
  }

  try {
    const existing = await prisma.siswa.findUnique({
      where: { sekolahId_nis: { sekolahId: user.sekolahId, nis } },
    });
    if (existing) {
      return { success: false, message: `NIS "${nis}" sudah terdaftar.` };
    }

    // Hitung nomor absen berikutnya di kelas ini (urutan berdasarkan nama, append di akhir)
    const jumlahSiswa = await prisma.siswaKelas.count({
      where: { kelasId, tanggalKeluar: null },
    });

    await prisma.siswa.create({
      data: {
        sekolahId: user.sekolahId,
        nis,
        nama,
        jenisKelamin,
        isActive: true,
        kelas: {
          create: {
            kelasId,
            nomorAbsen: jumlahSiswa + 1,
          },
        },
      },
    });
  } catch (error) {
    console.error(error);
    return { success: false, message: "Terjadi kesalahan, coba lagi." };
  }

  redirect("/admin/siswa");
}

export async function toggleSiswaAction(siswaId: string, isActive: boolean) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN_SEKOLAH" || !user.sekolahId) {
    return { success: false, message: "Tidak terautentikasi." };
  }

  try {
    await prisma.siswa.update({
      where: { id: siswaId },
      data: { isActive },
    });
    revalidatePath("/admin/siswa");
    return { success: true, message: "" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Terjadi kesalahan." };
  }
}

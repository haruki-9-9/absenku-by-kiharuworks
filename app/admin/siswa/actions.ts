"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export async function tambahSiswaAction(
  _prevState: { success: boolean; message: string },
  formData: FormData
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN_SEKOLAH" || !user.sekolahId) {
    return { success: false, message: "Tidak terautentikasi." };
  }

  const nis = String(formData.get("nis") || "").trim();
  const nama = String(formData.get("nama") || "").trim();
  const jenisKelamin = String(formData.get("jenisKelamin") || "").trim();

  if (!nis || !nama || !jenisKelamin) {
    return { success: false, message: "Semua field wajib diisi." };
  }

  if (!["L", "P"].includes(jenisKelamin)) {
    return { success: false, message: "Jenis kelamin tidak valid." };
  }

  try {
    const existing = await prisma.siswa.findUnique({
      where: { sekolahId_nis: { sekolahId: user.sekolahId, nis } },
    });

    if (existing) {
      return { success: false, message: `NIS "${nis}" sudah terdaftar.` };
    }

    await prisma.siswa.create({
      data: {
        sekolahId: user.sekolahId,
        nis,
        nama,
        jenisKelamin,
        isActive: true,
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

    return { success: true, message: "" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Terjadi kesalahan." };
  }
}

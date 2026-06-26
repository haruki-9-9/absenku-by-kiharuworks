"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { revalidatePath } from "next/cache";

export async function tambahTahunAjaranAction(
  _prevState: { success: boolean; message: string },
  formData: FormData
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN_SEKOLAH" || !user.sekolahId)
    return { success: false, message: "Tidak terautentikasi." };

  const nama = String(formData.get("nama") || "").trim();
  if (!nama) return { success: false, message: "Nama tahun ajaran wajib diisi." };

  try {
    const existing = await prisma.tahunAjaran.findUnique({
      where: { sekolahId_nama: { sekolahId: user.sekolahId, nama } },
    });
    if (existing) return { success: false, message: `Tahun ajaran "${nama}" sudah ada.` };

    await prisma.tahunAjaran.create({
      data: { sekolahId: user.sekolahId, nama, isActive: true },
    });
  } catch (error) {
    console.error(error);
    return { success: false, message: "Terjadi kesalahan, coba lagi." };
  }

  redirect("/admin/tahun-ajaran");
}

export async function toggleTahunAjaranAction(tahunAjaranId: string, isActive: boolean) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN_SEKOLAH") return;

  await prisma.tahunAjaran.update({ where: { id: tahunAjaranId }, data: { isActive } });
  revalidatePath("/admin/tahun-ajaran");
}

export async function tambahSemesterAction(
  tahunAjaranId: string,
  _prevState: { success: boolean; message: string },
  formData: FormData
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN_SEKOLAH" || !user.sekolahId)
    return { success: false, message: "Tidak terautentikasi." };

  const nama = String(formData.get("nama") || "").trim();
  const tanggalMulai = String(formData.get("tanggalMulai") || "").trim();
  const tanggalSelesai = String(formData.get("tanggalSelesai") || "").trim();

  if (!nama || !tanggalMulai || !tanggalSelesai)
    return { success: false, message: "Semua field wajib diisi." };

  if (new Date(tanggalMulai) >= new Date(tanggalSelesai))
    return { success: false, message: "Tanggal mulai harus sebelum tanggal selesai." };

  try {
    await prisma.semester.create({
      data: {
        tahunAjaranId,
        nama,
        tanggalMulai: new Date(tanggalMulai),
        tanggalSelesai: new Date(tanggalSelesai),
        isActive: true,
      },
    });
  } catch (error) {
    console.error(error);
    return { success: false, message: "Terjadi kesalahan, coba lagi." };
  }

  redirect("/admin/tahun-ajaran");
}

export async function toggleSemesterAction(semesterId: string, isActive: boolean) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN_SEKOLAH") return;

  await prisma.semester.update({ where: { id: semesterId }, data: { isActive } });
  revalidatePath("/admin/tahun-ajaran");
}

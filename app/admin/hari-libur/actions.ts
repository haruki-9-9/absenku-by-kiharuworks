"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { revalidatePath } from "next/cache";

export async function tambahHariLiburAction(
  _prevState: { success: boolean; message: string },
  formData: FormData
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN_SEKOLAH" || !user.sekolahId) {
    return { success: false, message: "Tidak terautentikasi." };
  }

  const tanggalStr = String(formData.get("tanggal") || "").trim();
  const keterangan = String(formData.get("keterangan") || "").trim();

  if (!tanggalStr || !keterangan) {
    return { success: false, message: "Tanggal dan keterangan wajib diisi." };
  }

  const tanggal = new Date(tanggalStr);
  if (isNaN(tanggal.getTime())) {
    return { success: false, message: "Format tanggal tidak valid." };
  }

  try {
    await prisma.hariLibur.create({
      data: {
        sekolahId: user.sekolahId,
        tanggal,
        keterangan,
      },
    });

    revalidatePath("/admin/hari-libur");
    return { success: true, message: "Hari libur berhasil ditambahkan." };
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return { success: false, message: "Tanggal tersebut sudah ada di daftar hari libur." };
    }
    console.error(error);
    return { success: false, message: "Terjadi kesalahan, coba lagi." };
  }
}

export async function hapusHariLiburAction(id: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN_SEKOLAH" || !user.sekolahId) return;

  await prisma.hariLibur.deleteMany({
    where: { id, sekolahId: user.sekolahId },
  });

  revalidatePath("/admin/hari-libur");
}

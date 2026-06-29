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

  const tanggalMulaiStr = String(formData.get("tanggalMulai") || "").trim();
  const tanggalAkhirStr = String(formData.get("tanggalAkhir") || "").trim();
  const keterangan = String(formData.get("keterangan") || "").trim();

  if (!tanggalMulaiStr || !keterangan) {
    return { success: false, message: "Tanggal dan keterangan wajib diisi." };
  }

  const tanggalMulai = new Date(tanggalMulaiStr);
  if (isNaN(tanggalMulai.getTime())) {
    return { success: false, message: "Format tanggal tidak valid." };
  }

  // Kalau ada tanggal akhir, generate semua tanggal dalam range
  const tanggalAkhir = tanggalAkhirStr ? new Date(tanggalAkhirStr) : tanggalMulai;
  if (isNaN(tanggalAkhir.getTime())) {
    return { success: false, message: "Format tanggal akhir tidak valid." };
  }
  if (tanggalAkhir < tanggalMulai) {
    return { success: false, message: "Tanggal akhir tidak boleh sebelum tanggal mulai." };
  }

  // Generate semua tanggal dalam range
  const tanggalList: Date[] = [];
  const current = new Date(tanggalMulai);
  while (current <= tanggalAkhir) {
    tanggalList.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  if (tanggalList.length > 365) {
    return { success: false, message: "Range maksimal 365 hari." };
  }

  try {
    // Upsert semua tanggal (skip yang sudah ada)
    let berhasil = 0;
    let duplikat = 0;

    for (const tanggal of tanggalList) {
      try {
        await prisma.hariLibur.create({
          data: {
            sekolahId: user.sekolahId,
            tanggal,
            keterangan,
          },
        });
        berhasil++;
      } catch (e: unknown) {
        if (e && typeof e === "object" && "code" in e && (e as { code: string }).code === "P2002") {
          duplikat++;
        } else {
          throw e;
        }
      }
    }

    revalidatePath("/admin/hari-libur");

    if (tanggalList.length === 1) {
      return { success: true, message: "Hari libur berhasil ditambahkan." };
    }

    const msg = duplikat > 0
      ? `${berhasil} hari libur ditambahkan, ${duplikat} sudah ada sebelumnya.`
      : `${berhasil} hari libur berhasil ditambahkan (${tanggalMulaiStr} s/d ${tanggalAkhirStr}).`;

    return { success: true, message: msg };
  } catch (error) {
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

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export async function naikkanKelasAction(
  _prevState: { success: boolean; message: string; count: number },
  formData: FormData
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN_SEKOLAH" || !user.sekolahId) {
    return { success: false, message: "Tidak terautentikasi.", count: 0 };
  }

  const sekolahId = user.sekolahId;
  const kelasAsalId = String(formData.get("kelasAsalId") || "").trim();
  const kelasTujuanId = String(formData.get("kelasTujuanId") || "").trim();

  if (!kelasAsalId || !kelasTujuanId) {
    return { success: false, message: "Kelas asal dan tujuan wajib dipilih.", count: 0 };
  }

  if (kelasAsalId === kelasTujuanId) {
    return { success: false, message: "Kelas asal dan tujuan tidak boleh sama.", count: 0 };
  }

  try {
    // Validasi kedua kelas milik sekolah ini
    const [kelasAsal, kelasTujuan] = await Promise.all([
      prisma.kelas.findFirst({ where: { id: kelasAsalId, sekolahId } }),
      prisma.kelas.findFirst({ where: { id: kelasTujuanId, sekolahId } }),
    ]);

    if (!kelasAsal) return { success: false, message: "Kelas asal tidak valid.", count: 0 };
    if (!kelasTujuan) return { success: false, message: "Kelas tujuan tidak valid.", count: 0 };

    // Ambil semua siswa aktif di kelas asal
    const siswaKelasAsal = await prisma.siswaKelas.findMany({
      where: { kelasId: kelasAsalId, tanggalKeluar: null, siswa: { isActive: true } },
      include: { siswa: true },
    });

    if (siswaKelasAsal.length === 0) {
      return { success: false, message: "Tidak ada siswa aktif di kelas asal.", count: 0 };
    }

    const sekarang = new Date();

    await prisma.$transaction(async (tx) => {
      for (const sk of siswaKelasAsal) {
        // Tutup keanggotaan di kelas asal
        await tx.siswaKelas.update({
          where: { id: sk.id },
          data: { tanggalKeluar: sekarang },
        });

        // Cek apakah siswa sudah ada di kelas tujuan (bisa saja sudah dipindah sebagian)
        const existing = await tx.siswaKelas.findFirst({
          where: { siswaId: sk.siswaId, kelasId: kelasTujuanId, tanggalKeluar: null },
        });

        if (!existing) {
          // Hitung nomor absen terakhir di kelas tujuan
          const lastAbsen = await tx.siswaKelas.findFirst({
            where: { kelasId: kelasTujuanId },
            orderBy: { nomorAbsen: "desc" },
            select: { nomorAbsen: true },
          });

          await tx.siswaKelas.create({
            data: {
              siswaId: sk.siswaId,
              kelasId: kelasTujuanId,
              nomorAbsen: (lastAbsen?.nomorAbsen ?? 0) + 1,
              tanggalMasuk: sekarang,
            },
          });
        }
      }
    });

    revalidatePath("/admin/siswa");
    revalidatePath("/admin/kenaikan-kelas");

    return {
      success: true,
      message: `${siswaKelasAsal.length} siswa berhasil dipindahkan dari "${kelasAsal.nama}" ke "${kelasTujuan.nama}".`,
      count: siswaKelasAsal.length,
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Terjadi kesalahan, coba lagi.", count: 0 };
  }
}

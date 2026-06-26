"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export async function tambahKelasAction(
  _prevState: { success: boolean; message: string },
  formData: FormData
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN_SEKOLAH" || !user.sekolahId) {
    return { success: false, message: "Tidak terautentikasi." };
  }

  const nama = String(formData.get("nama") || "").trim();
  if (!nama) {
    return { success: false, message: "Nama kelas wajib diisi." };
  }

  try {
    // Cek kuota kelas dari langganan
    const langganan = await prisma.langganan.findUnique({
      where: { sekolahId: user.sekolahId },
    });

    if (!langganan) {
      return { success: false, message: "Data langganan tidak ditemukan." };
    }

    const kelasAktif = await prisma.kelas.count({
      where: { sekolahId: user.sekolahId, isActive: true },
    });

    if (kelasAktif >= langganan.maxKelas) {
      return {
        success: false,
        message: `Kuota kelas paket ${langganan.paket} sudah penuh (${langganan.maxKelas} kelas aktif).`,
      };
    }

    // Cek duplikat nama kelas
    const existing = await prisma.kelas.findUnique({
      where: { sekolahId_nama: { sekolahId: user.sekolahId, nama } },
    });

    if (existing) {
      return { success: false, message: `Kelas "${nama}" sudah ada.` };
    }

    await prisma.kelas.create({
      data: {
        sekolahId: user.sekolahId,
        nama,
        isActive: true,
      },
    });
  } catch (error) {
    console.error(error);
    return { success: false, message: "Terjadi kesalahan, coba lagi." };
  }

  redirect("/admin/kelas");
}

export async function toggleKelasAction(kelasId: string, isActive: boolean) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN_SEKOLAH" || !user.sekolahId) {
    return { success: false, message: "Tidak terautentikasi." };
  }

  try {
    // Kalau mau diaktifkan lagi, cek kuota dulu
    if (isActive) {
      const langganan = await prisma.langganan.findUnique({
        where: { sekolahId: user.sekolahId },
      });

      if (langganan) {
        const kelasAktif = await prisma.kelas.count({
          where: { sekolahId: user.sekolahId, isActive: true },
        });

        if (kelasAktif >= langganan.maxKelas) {
          return {
            success: false,
            message: `Kuota kelas paket ${langganan.paket} sudah penuh (${langganan.maxKelas} kelas aktif).`,
          };
        }
      }
    }

    await prisma.kelas.update({
      where: { id: kelasId },
      data: { isActive },
    });

    return { success: true, message: "" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Terjadi kesalahan." };
  }
}

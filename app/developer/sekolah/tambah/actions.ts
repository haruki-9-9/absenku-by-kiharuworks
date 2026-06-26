"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";

const PAKET_MAX_KELAS: Record<string, number> = {
  STARTER: 6,
  BASIC: 12,
  PRO: 24,
  ENTERPRISE: 9999,
};

export async function tambahSekolahAction(
  _prevState: { success: boolean; message: string },
  formData: FormData
) {
  const nama = String(formData.get("nama") || "").trim();
  const alamat = String(formData.get("alamat") || "").trim();
  const emailAdmin = String(formData.get("emailAdmin") || "").trim().toLowerCase();
  const namaAdmin = String(formData.get("namaAdmin") || "").trim();
  const passwordAdmin = String(formData.get("passwordAdmin") || "").trim();
  const tanggalMulai = String(formData.get("tanggalMulai") || "").trim();
  const tanggalBerakhir = String(formData.get("tanggalBerakhir") || "").trim();
  const paket = String(formData.get("paket") || "STARTER").trim();

  if (!nama || !emailAdmin || !namaAdmin || !passwordAdmin || !tanggalMulai || !tanggalBerakhir) {
    return { success: false, message: "Semua field wajib diisi." };
  }

  if (passwordAdmin.length < 8) {
    return { success: false, message: "Password admin minimal 8 karakter." };
  }

  if (!["STARTER", "BASIC", "PRO", "ENTERPRISE"].includes(paket)) {
    return { success: false, message: "Paket tidak valid." };
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email: emailAdmin } });
    if (existingUser) {
      return { success: false, message: "Email admin sudah digunakan." };
    }

    const hashedPassword = await hashPassword(passwordAdmin);
    const maxKelas = PAKET_MAX_KELAS[paket];

    await prisma.$transaction(async (tx) => {
      const sekolah = await tx.sekolah.create({
        data: { nama, alamat: alamat || null },
      });

      await tx.user.create({
        data: {
          name: namaAdmin,
          email: emailAdmin,
          password: hashedPassword,
          role: "ADMIN_SEKOLAH",
          isActive: true,
          sekolahId: sekolah.id,
        },
      });

      await tx.langganan.create({
        data: {
          sekolahId: sekolah.id,
          paket: paket as "STARTER" | "BASIC" | "PRO" | "ENTERPRISE",
          maxKelas,
          status: "AKTIF",
          tanggalMulai: new Date(tanggalMulai),
          tanggalBerakhir: new Date(tanggalBerakhir),
        },
      });

      await tx.konfigurasiSekolah.create({
        data: {
          sekolahId: sekolah.id,
          jamLock: "15:00",
          batasAlpa: 3,
          zonaWaktu: "Asia/Jakarta",
        },
      });
    });
  } catch (error) {
    console.error(error);
    return { success: false, message: "Terjadi kesalahan, coba lagi." };
  }

  redirect("/developer/sekolah");
}

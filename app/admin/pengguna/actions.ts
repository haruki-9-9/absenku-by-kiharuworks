"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { hashPassword } from "@/lib/auth/password";

export async function tambahPenggunaAction(
  _prevState: { success: boolean; message: string },
  formData: FormData
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN_SEKOLAH" || !user.sekolahId) {
    return { success: false, message: "Tidak terautentikasi." };
  }

  const nama = String(formData.get("nama") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "").trim();
  const role = String(formData.get("role") || "").trim();
  const kelasId = String(formData.get("kelasId") || "").trim();

  if (!nama || !email || !password || !role) {
    return { success: false, message: "Semua field wajib diisi." };
  }

  if (!["SEKRETARIS", "WALI_KELAS"].includes(role)) {
    return { success: false, message: "Role tidak valid." };
  }

  if (password.length < 8) {
    return { success: false, message: "Password minimal 8 karakter." };
  }

  if (role === "SEKRETARIS" && !kelasId) {
    return { success: false, message: "Petugas Absensi wajib ditugaskan ke kelas." };
  }

  if (role === "WALI_KELAS" && !kelasId) {
    return { success: false, message: "Wali Kelas wajib ditugaskan ke kelas." };
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, message: "Email sudah digunakan." };
    }

    if (kelasId) {
      // Pastikan kelas milik sekolah ini
      const kelas = await prisma.kelas.findFirst({
        where: { id: kelasId, sekolahId: user.sekolahId },
      });
      if (!kelas) {
        return { success: false, message: "Kelas tidak valid." };
      }

      if (role === "SEKRETARIS") {
        const existing = await prisma.sekretaris.findUnique({ where: { kelasId } });
        if (existing) {
          return { success: false, message: `Kelas "${kelas.nama}" sudah memiliki Petugas Absensi.` };
        }
      }

      if (role === "WALI_KELAS") {
        const existing = await prisma.waliKelas.findUnique({ where: { kelasId } });
        if (existing) {
          return { success: false, message: `Kelas "${kelas.nama}" sudah memiliki Wali Kelas.` };
        }
      }
    }

    const hashedPassword = await hashPassword(password);

    await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: nama,
          email,
          password: hashedPassword,
          role: role as "SEKRETARIS" | "WALI_KELAS",
          isActive: true,
          sekolahId: user.sekolahId,
        },
      });

      if (role === "SEKRETARIS" && kelasId) {
        await tx.sekretaris.create({
          data: { userId: newUser.id, kelasId },
        });
      }

      if (role === "WALI_KELAS" && kelasId) {
        await tx.waliKelas.create({
          data: { userId: newUser.id, kelasId },
        });
      }
    });
  } catch (error) {
    console.error(error);
    return { success: false, message: "Terjadi kesalahan, coba lagi." };
  }

  redirect("/admin/pengguna");
}

export async function togglePenggunaAction(userId: string, isActive: boolean) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN_SEKOLAH" || !user.sekolahId) {
    return { success: false, message: "Tidak terautentikasi." };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });

    return { success: true, message: "" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Terjadi kesalahan." };
  }
}

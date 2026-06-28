"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { verifyPassword, hashPassword } from "@/lib/auth/password";

function validatePasswordStrength(password: string): string | null {
  if (password.length < 8) return "Password minimal 8 karakter.";
  if (!/[a-zA-Z]/.test(password)) return "Password harus mengandung huruf.";
  if (!/[0-9]/.test(password)) return "Password harus mengandung angka.";
  return null;
}

export async function gantiPasswordAction(
  _prevState: { success: boolean; message: string },
  formData: FormData
) {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: "Tidak terautentikasi." };

  const passwordLama = String(formData.get("passwordLama") || "").trim();
  const passwordBaru = String(formData.get("passwordBaru") || "").trim();
  const konfirmasi   = String(formData.get("konfirmasi")   || "").trim();

  if (!passwordLama || !passwordBaru || !konfirmasi) {
    return { success: false, message: "Semua field wajib diisi." };
  }

  // Validasi kekuatan password baru
  const strengthError = validatePasswordStrength(passwordBaru);
  if (strengthError) return { success: false, message: strengthError };

  if (passwordBaru !== konfirmasi) {
    return { success: false, message: "Konfirmasi password tidak cocok." };
  }

  if (passwordLama === passwordBaru) {
    return { success: false, message: "Password baru tidak boleh sama dengan password lama." };
  }

  try {
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) return { success: false, message: "User tidak ditemukan." };
    if (!dbUser.password) return { success: false, message: "Akun ini tidak menggunakan password." };

    const valid = await verifyPassword(passwordLama, dbUser.password);
    if (!valid) return { success: false, message: "Password lama tidak sesuai." };

    const hashed = await hashPassword(passwordBaru);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

    return { success: true, message: "Password berhasil diubah." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Terjadi kesalahan, coba lagi." };
  }
}

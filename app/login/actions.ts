"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, clearSession } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";

export type LoginActionState = {
  success: boolean;
  message: string;
};

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  try {
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "").trim();

    if (!email || !password) {
      return { success: false, message: "Email dan password wajib diisi." };
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      return { success: false, message: "Email atau password salah." };
    }

    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      return { success: false, message: "Email atau password salah." };
    }

    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      sekolahId: user.sekolahId ?? null,
    });

    // Redirect sesuai role
    if (user.role === "DEVELOPER") {
      redirect("/developer");
    }

    if (user.role === "ADMIN_SEKOLAH") {
      redirect("/admin");
    }

    if (user.role === "SEKRETARIS") {
      redirect("/sekretaris");
    }

    if (user.role === "WALI_KELAS") {
      redirect("/wali");
    }

    redirect("/login");
  } catch (error) {
    // redirect() melempar NEXT_REDIRECT secara internal — biarkan lewat
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof (error as { digest?: unknown }).digest === "string" &&
      (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    return { success: false, message: "Terjadi kesalahan saat login, coba lagi." };
  }
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

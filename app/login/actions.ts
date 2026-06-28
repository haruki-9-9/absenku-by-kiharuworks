"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, clearSession } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { headers } from "next/headers";

export type LoginActionState = {
  success: boolean;
  message: string;
  lockedUntil?: string | null;
};

// Konstanta rate limiting
const MAX_ATTEMPTS_PER_EMAIL = 5;  // max 5x gagal per email
const MAX_ATTEMPTS_PER_IP    = 20; // max 20x gagal per IP (mencegah distributed attack)
const LOCKOUT_MINUTES        = 15;
const WINDOW_MINUTES         = 15;

async function getClientIP(headersList: Awaited<ReturnType<typeof headers>>): Promise<string> {
  return (
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown"
  );
}

async function checkRateLimit(email: string, ip: string): Promise<{
  blocked: boolean;
  lockedUntil: Date | null;
  reason: string;
}> {
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);

  const [emailAttempts, ipAttempts] = await Promise.all([
    prisma.loginAttempt.count({
      where: {
        email: email.toLowerCase(),
        success: false,
        createdAt: { gte: windowStart },
      },
    }),
    prisma.loginAttempt.count({
      where: {
        ip,
        success: false,
        createdAt: { gte: windowStart },
      },
    }),
  ]);

  if (emailAttempts >= MAX_ATTEMPTS_PER_EMAIL) {
    // Cari attempt terakhir untuk hitung lockout
    const lastAttempt = await prisma.loginAttempt.findFirst({
      where: { email: email.toLowerCase(), success: false, createdAt: { gte: windowStart } },
      orderBy: { createdAt: "desc" },
    });
    const lockedUntil = lastAttempt
      ? new Date(lastAttempt.createdAt.getTime() + LOCKOUT_MINUTES * 60 * 1000)
      : null;
    return { blocked: true, lockedUntil, reason: "email" };
  }

  if (ipAttempts >= MAX_ATTEMPTS_PER_IP) {
    return { blocked: true, lockedUntil: null, reason: "ip" };
  }

  return { blocked: false, lockedUntil: null, reason: "" };
}

async function recordAttempt(email: string, ip: string, success: boolean) {
  await prisma.loginAttempt.create({
    data: { email: email.toLowerCase(), ip, success },
  });

  // Cleanup: hapus attempt lama (lebih dari 24 jam) secara async
  prisma.loginAttempt.deleteMany({
    where: { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
  }).catch(() => {});
}

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  try {
    const headersList = await headers();
    const ip = await getClientIP(headersList);

    const email    = String(formData.get("email")    || "").trim().toLowerCase();
    const password = String(formData.get("password") || "").trim();

    if (!email || !password) {
      return { success: false, message: "Email dan password wajib diisi." };
    }

    // Cek rate limit sebelum query DB
    const rateLimit = await checkRateLimit(email, ip);
    if (rateLimit.blocked) {
      if (rateLimit.reason === "email" && rateLimit.lockedUntil) {
        const sisaMenit = Math.ceil((rateLimit.lockedUntil.getTime() - Date.now()) / 60000);
        if (sisaMenit > 0) {
          return {
            success: false,
            message: `Akun sementara dikunci karena terlalu banyak percobaan gagal. Coba lagi dalam ${sisaMenit} menit.`,
            lockedUntil: rateLimit.lockedUntil.toISOString(),
          };
        }
      } else if (rateLimit.reason === "ip") {
        return {
          success: false,
          message: "Terlalu banyak percobaan login dari jaringan ini. Coba lagi dalam 15 menit.",
        };
      }
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        sekolah: {
          include: { langganan: true },
        },
      },
    });

    // Selalu catat attempt & kembalikan pesan generik (jangan bocorkan apakah email ada)
    if (!user || !user.isActive || !user.password) {
      await recordAttempt(email, ip, false);
      return { success: false, message: "Email atau password salah." };
    }

    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      await recordAttempt(email, ip, false);

      // Hitung sisa percobaan
      const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);
      const attemptCount = await prisma.loginAttempt.count({
        where: { email, success: false, createdAt: { gte: windowStart } },
      });
      const sisaPercobaan = MAX_ATTEMPTS_PER_EMAIL - attemptCount;

      if (sisaPercobaan <= 0) {
        return {
          success: false,
          message: `Akun dikunci selama ${LOCKOUT_MINUTES} menit karena terlalu banyak percobaan gagal.`,
        };
      }

      return {
        success: false,
        message: `Email atau password salah. ${sisaPercobaan} percobaan tersisa sebelum akun dikunci.`,
      };
    }

    // Login berhasil — catat sukses & lanjutkan
    await recordAttempt(email, ip, true);

    // Ambil status langganan
    let langgananStatus: "AKTIF" | "EXPIRED" | "NONAKTIF" | null = null;

    if (user.sekolah?.langganan) {
      const l = user.sekolah.langganan;
      if (l.status === "AKTIF" && new Date(l.tanggalBerakhir) < new Date()) {
        await prisma.langganan.update({
          where: { id: l.id },
          data: { status: "EXPIRED" },
        });
        langgananStatus = "EXPIRED";
      } else {
        langgananStatus = l.status;
      }
    }

    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      sekolahId: user.sekolahId ?? null,
      langgananStatus,
    });

    if (user.role === "DEVELOPER")    redirect("/developer");
    if (user.role === "ADMIN_SEKOLAH") redirect("/admin");
    if (user.role === "SEKRETARIS")   redirect("/sekretaris");
    if (user.role === "WALI_KELAS")   redirect("/wali");

    redirect("/login");
  } catch (error) {
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

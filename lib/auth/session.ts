import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

// __Host- prefix wajib Secure + path "/" + tanpa atribut Domain.
// Browser menolak cookie ini di koneksi non-HTTPS, jadi hanya dipakai di production.
const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === "production" ? "__Host-absenku_session" : "absenku_session";

// Nama cookie lama (sebelum pakai prefix __Host-), dipakai untuk membersihkan
// cookie lama di browser user yang masih login dari sebelum perubahan ini.
const LEGACY_COOKIE_NAME = "absenku_session";

type SessionPayload = {
  userId: string;
  email: string;
  role: "DEVELOPER" | "ADMIN_SEKOLAH" | "SEKRETARIS" | "WALI_KELAS";
  sekolahId: string | null;
  langgananStatus: "AKTIF" | "EXPIRED" | "NONAKTIF" | null;
  sessionVersion: number;
};

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET belum diisi di .env");
  }

  if (secret.length < 32) {
    throw new Error(
      "AUTH_SECRET terlalu pendek — minimal 32 karakter. " +
        "Generate dengan: openssl rand -base64 32"
    );
  }

  return new TextEncoder().encode(secret);
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  // Bersihkan cookie lama (nama tanpa prefix) kalau ada, supaya tidak menumpuk
  if (SESSION_COOKIE_NAME !== LEGACY_COOKIE_NAME) {
    cookieStore.delete(LEGACY_COOKIE_NAME);
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  // Fallback ke nama lama untuk user yang sesi-nya dibuat sebelum migrasi __Host- prefix
  const token =
    cookieStore.get(SESSION_COOKIE_NAME)?.value ??
    cookieStore.get(LEGACY_COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());

    return {
      userId: String(payload.userId),
      email: String(payload.email),
      role: payload.role as SessionPayload["role"],
      sekolahId: payload.sekolahId ? String(payload.sekolahId) : null,
      langgananStatus: (payload.langgananStatus as SessionPayload["langgananStatus"]) ?? null,
      sessionVersion: typeof payload.sessionVersion === "number" ? payload.sessionVersion : 0,
    };
  } catch {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(LEGACY_COOKIE_NAME);
}

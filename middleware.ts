import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "absenku_session";

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET belum diisi di .env");
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoginRoute      = pathname.startsWith("/login");
  const isDeveloperRoute  = pathname.startsWith("/developer");
  const isAdminRoute      = pathname.startsWith("/admin");
  const isSekretarisRoute = pathname.startsWith("/sekretaris");
  const isWaliRoute       = pathname.startsWith("/wali");
  const isExpiredRoute    = pathname.startsWith("/langganan-habis");

  // Route publik — lewatkan
  if (!isLoginRoute && !isDeveloperRoute && !isAdminRoute && !isSekretarisRoute && !isWaliRoute && !isExpiredRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    if (isLoginRoute || isExpiredRoute) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    const role            = String(payload.role || "");
    const userId          = String(payload.userId || "");
    const langgananStatus = String(payload.langgananStatus || "");

    // ── Session invalidation: cek isActive user di DB ──
    // Hanya untuk protected routes, skip untuk login/expired
    if (!isLoginRoute && !isExpiredRoute && userId) {
      const res = await fetch(`${request.nextUrl.origin}/api/auth/check-active?userId=${userId}`, {
        headers: { cookie: request.headers.get("cookie") || "" },
      });

      if (!res.ok) {
        // User tidak aktif atau tidak ditemukan — paksa logout
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete(SESSION_COOKIE_NAME);
        return response;
      }
    }

    // Sudah login → redirect ke dashboard masing-masing
    if (isLoginRoute) {
      if (role === "DEVELOPER")     return NextResponse.redirect(new URL("/developer", request.url));
      if (role === "ADMIN_SEKOLAH") return NextResponse.redirect(new URL("/admin", request.url));
      if (role === "SEKRETARIS")    return NextResponse.redirect(new URL("/sekretaris", request.url));
      if (role === "WALI_KELAS")    return NextResponse.redirect(new URL("/wali", request.url));
      return NextResponse.next();
    }

    // Blokir akses user sekolah jika langganan EXPIRED
    const isSekolahUser = ["ADMIN_SEKOLAH", "SEKRETARIS", "WALI_KELAS"].includes(role);
    if (isSekolahUser && langgananStatus === "EXPIRED" && !isExpiredRoute) {
      return NextResponse.redirect(new URL("/langganan-habis", request.url));
    }

    // Halaman langganan-habis: kalau masih aktif, redirect ke dashboard
    if (isExpiredRoute && isSekolahUser && langgananStatus !== "EXPIRED") {
      if (role === "ADMIN_SEKOLAH") return NextResponse.redirect(new URL("/admin", request.url));
      if (role === "SEKRETARIS")    return NextResponse.redirect(new URL("/sekretaris", request.url));
      if (role === "WALI_KELAS")    return NextResponse.redirect(new URL("/wali", request.url));
    }

    // Proteksi route per role
    if (isDeveloperRoute  && role !== "DEVELOPER")     return NextResponse.redirect(new URL("/login", request.url));
    if (isAdminRoute      && role !== "ADMIN_SEKOLAH") return NextResponse.redirect(new URL("/login", request.url));
    if (isSekretarisRoute && role !== "SEKRETARIS")    return NextResponse.redirect(new URL("/login", request.url));
    if (isWaliRoute       && role !== "WALI_KELAS")    return NextResponse.redirect(new URL("/login", request.url));

    return NextResponse.next();
  } catch {
    if (isLoginRoute || isExpiredRoute) return NextResponse.next();
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: [
    "/login",
    "/developer/:path*",
    "/admin/:path*",
    "/sekretaris/:path*",
    "/wali/:path*",
    "/langganan-habis",
  ],
};

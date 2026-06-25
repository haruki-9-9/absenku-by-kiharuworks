import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "absenku_session";

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET belum diisi di .env");
  }

  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoginRoute = pathname.startsWith("/login");
  const isDeveloperRoute = pathname.startsWith("/developer");
  const isAdminRoute = pathname.startsWith("/admin");
  const isSekretarisRoute = pathname.startsWith("/sekretaris");
  const isWaliRoute = pathname.startsWith("/wali");

  // Kalau bukan route yang dilindungi, lewatkan
  if (!isLoginRoute && !isDeveloperRoute && !isAdminRoute && !isSekretarisRoute && !isWaliRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    if (isLoginRoute) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    const role = String(payload.role || "");

    // Sudah login, akses /login → redirect ke dashboard
    if (isLoginRoute) {
      if (role === "DEVELOPER") return NextResponse.redirect(new URL("/developer", request.url));
      if (role === "ADMIN_SEKOLAH") return NextResponse.redirect(new URL("/admin", request.url));
      if (role === "SEKRETARIS") return NextResponse.redirect(new URL("/sekretaris", request.url));
      if (role === "WALI_KELAS") return NextResponse.redirect(new URL("/wali", request.url));
      return NextResponse.next();
    }

    // Proteksi route per role
    if (isDeveloperRoute && role !== "DEVELOPER") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (isAdminRoute && role !== "ADMIN_SEKOLAH") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (isSekretarisRoute && role !== "SEKRETARIS") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (isWaliRoute && role !== "WALI_KELAS") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  } catch {
    if (isLoginRoute) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    "/login",
    "/developer/:path*",
    "/admin/:path*",
    "/sekretaris/:path*",
    "/wali/:path*",
  ],
};

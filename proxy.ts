import { NextRequest, NextResponse } from "next/server";

const roleHome: Record<string, string> = {
  DEVELOPER: "/developer",
  ADMIN_SEKOLAH: "/admin",
  SEKRETARIS: "/sekretaris",
  WALI_KELAS: "/wali",
};

const roleRoutes: Record<string, string[]> = {
  DEVELOPER: ["/developer"],
  ADMIN_SEKOLAH: ["/admin"],
  SEKRETARIS: ["/sekretaris"],
  WALI_KELAS: ["/wali"],
};

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Ambil session dari better-auth cookie
  const sessionCookie =
    req.cookies.get("better-auth.session_token")?.value ||
    req.cookies.get("__Secure-better-auth.session_token")?.value;

  const isLoggedIn = !!sessionCookie;

  if (pathname === "/login") {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
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

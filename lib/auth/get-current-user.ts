import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function getCurrentUser() {
  const session = await getSession();

  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user || !user.isActive) return null;

  // JWT versioning: kalau sessionVersion di JWT tidak cocok dengan DB,
  // berarti sesi ini sudah di-invalidate (misal: admin nonaktifkan user,
  // reset password, atau force logout) — tolak meski JWT masih valid secara kriptografi.
  if (session.sessionVersion !== user.sessionVersion) return null;

  return user;
}

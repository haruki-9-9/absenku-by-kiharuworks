import { getCurrentUser } from "@/lib/auth/get-current-user";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !user.sekolahId || user.role !== "ADMIN_SEKOLAH") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const kelas = await prisma.kelas.findMany({
    where: { sekolahId: user.sekolahId, isActive: true },
    orderBy: { nama: "asc" },
    select: { id: true, nama: true },
  });

  return NextResponse.json(kelas);
}

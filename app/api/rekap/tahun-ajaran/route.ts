import { getCurrentUser } from "@/lib/auth/get-current-user";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !user.sekolahId || user.role !== "ADMIN_SEKOLAH") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tahunAjaran = await prisma.tahunAjaran.findMany({
    where: { sekolahId: user.sekolahId },
    orderBy: { nama: "desc" },
    select: {
      id: true,
      nama: true,
      semester: {
        orderBy: { tanggalMulai: "asc" },
        select: {
          id: true,
          nama: true,
          tanggalMulai: true,
          tanggalSelesai: true,
        },
      },
    },
  });

  return NextResponse.json(tahunAjaran);
}

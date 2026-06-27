import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN_SEKOLAH" || !user.sekolahId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sekolahId = user.sekolahId;
  const now = new Date();
  const tanggal = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Ambil semua kelas aktif + siswa aktif di dalamnya
  const kelasList = await prisma.kelas.findMany({
    where: { sekolahId, isActive: true },
    orderBy: { nama: "asc" },
    select: {
      id: true,
      nama: true,
      siswa: {
        where: { tanggalKeluar: null, siswa: { isActive: true } },
        select: { siswaId: true },
      },
    },
  });

  if (kelasList.length === 0) {
    return NextResponse.json({ tanggal: tanggal.toISOString(), kelas: [] });
  }

  const kelasIds = kelasList.map((k) => k.id);

  // Ambil semua absensi hari ini untuk semua kelas sekaligus
  const absensiList = await prisma.absensi.findMany({
    where: { sekolahId, kelasId: { in: kelasIds }, tanggal },
    select: { kelasId: true, siswaId: true, status: true },
  });

  // Group absensi per kelas
  const absensiPerKelas = new Map<string, Map<string, string>>();
  for (const a of absensiList) {
    if (!absensiPerKelas.has(a.kelasId)) absensiPerKelas.set(a.kelasId, new Map());
    absensiPerKelas.get(a.kelasId)!.set(a.siswaId, a.status);
  }

  const data = kelasList.map((kelas) => {
    const totalSiswa = kelas.siswa.length;
    const absensiKelas = absensiPerKelas.get(kelas.id) ?? new Map();
    let hadir = 0, sakit = 0, izin = 0, alpa = 0;

    for (const { siswaId } of kelas.siswa) {
      const status = absensiKelas.get(siswaId);
      if (status === "H") hadir++;
      else if (status === "S") sakit++;
      else if (status === "I") izin++;
      else if (status === "A") alpa++;
    }

    const sudahDiisi = hadir + sakit + izin + alpa;
    const belumDiisi = totalSiswa - sudahDiisi;
    const persen = totalSiswa > 0 ? Math.round((hadir / totalSiswa) * 100) : 0;

    return {
      id: kelas.id,
      nama: kelas.nama,
      totalSiswa,
      hadir,
      sakit,
      izin,
      alpa,
      belumDiisi,
      sudahDiisi,
      persen,
    };
  });

  return NextResponse.json({ tanggal: tanggal.toISOString(), kelas: data });
}

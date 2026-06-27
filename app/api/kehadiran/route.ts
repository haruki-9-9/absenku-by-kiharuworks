import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN_SEKOLAH" || !user.sekolahId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const kelasId = req.nextUrl.searchParams.get("kelasId");
  if (!kelasId) {
    return NextResponse.json({ error: "kelasId wajib" }, { status: 400 });
  }

  // Pastikan kelas milik sekolah ini
  const kelas = await prisma.kelas.findFirst({
    where: { id: kelasId, sekolahId: user.sekolahId },
  });
  if (!kelas) {
    return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 404 });
  }

  // Ambil tanggal hari ini (date only)
  const now = new Date();
  const tanggal = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Ambil semua siswa aktif di kelas ini
  const siswaKelas = await prisma.siswaKelas.findMany({
    where: {
      kelasId,
      tanggalKeluar: null,
      siswa: { isActive: true },
    },
    include: { siswa: true },
    orderBy: { nomorAbsen: "asc" },
  });

  // Ambil absensi hari ini untuk kelas ini
  const absensiHariIni = await prisma.absensi.findMany({
    where: {
      kelasId,
      sekolahId: user.sekolahId,
      tanggal,
    },
  });

  const absensiMap = new Map(absensiHariIni.map((a) => [a.siswaId, a]));

  const data = siswaKelas.map(({ siswa, nomorAbsen }) => {
    const absensi = absensiMap.get(siswa.id);
    return {
      siswaId: siswa.id,
      nomorAbsen,
      nama: siswa.nama,
      nis: siswa.nis,
      status: absensi?.status ?? null,
      keterangan: absensi?.keterangan ?? null,
    };
  });

  // Hitung ringkasan
  const total = data.length;
  const hadir = data.filter((d) => d.status === "H").length;
  const sakit = data.filter((d) => d.status === "S").length;
  const izin = data.filter((d) => d.status === "I").length;
  const alpa = data.filter((d) => d.status === "A").length;
  const belumDiisi = data.filter((d) => d.status === null).length;

  return NextResponse.json({
    kelas: { id: kelas.id, nama: kelas.nama },
    tanggal: tanggal.toISOString(),
    siswa: data,
    ringkasan: { total, hadir, sakit, izin, alpa, belumDiisi },
  });
}

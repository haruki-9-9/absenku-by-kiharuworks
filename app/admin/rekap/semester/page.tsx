import { getCurrentUser } from "@/lib/auth/get-current-user";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import RekapSemesterClient from "./RekapSemesterClient";

const NAMA_BULAN = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

async function getData(sekolahId: string, kelasId: string, semesterId: string) {
  const [kelas, sekolah, semester] = await Promise.all([
    prisma.kelas.findFirst({
      where: { id: kelasId, sekolahId },
      include: {
        tahunAjaran: { select: { nama: true } },
        siswa: {
          orderBy: { nomorAbsen: "asc" },
          include: {
            siswa: { select: { id: true, nama: true, nis: true } },
          },
        },
      },
    }),
    prisma.sekolah.findUnique({
      where: { id: sekolahId },
      select: { nama: true, alamat: true },
    }),
    prisma.semester.findUnique({
      where: { id: semesterId },
      select: { id: true, nama: true, tanggalMulai: true, tanggalSelesai: true },
    }),
  ]);

  if (!kelas || !semester) return { kelas, sekolah, semester, bulanList: [], absensiPerBulan: {} };

  // Tentukan bulan-bulan dalam semester
  const start = new Date(semester.tanggalMulai);
  const end = new Date(semester.tanggalSelesai);
  const bulanList: { bulan: number; tahun: number; label: string }[] = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cur <= end) {
    bulanList.push({
      bulan: cur.getMonth() + 1,
      tahun: cur.getFullYear(),
      label: `${NAMA_BULAN[cur.getMonth() + 1]} ${cur.getFullYear()}`,
    });
    cur.setMonth(cur.getMonth() + 1);
  }

  // Ambil semua absensi dalam rentang semester
  const absensiList = await prisma.absensi.findMany({
    where: {
      sekolahId,
      kelasId,
      tanggal: { gte: start, lte: end },
    },
    select: { siswaId: true, tanggal: true, status: true },
  });

  // Ambil hari libur dalam rentang semester
  const hariLiburList = await prisma.hariLibur.findMany({
    where: {
      sekolahId,
      tanggal: { gte: start, lte: end },
    },
    select: { tanggal: true },
  });

  const liburSet = new Set(hariLiburList.map((h) => new Date(h.tanggal).toISOString().slice(0, 10)));

  // Hitung hari efektif per bulan
  const hariEfektifPerBulan: Record<string, number> = {};
  for (const b of bulanList) {
    const jumlahHari = new Date(b.tahun, b.bulan, 0).getDate();
    let efektif = 0;
    for (let d = 1; d <= jumlahHari; d++) {
      const tgl = new Date(b.tahun, b.bulan - 1, d);
      if (tgl < start || tgl > end) continue;
      const hariIdx = tgl.getDay();
      const isoStr = tgl.toISOString().slice(0, 10);
      if (hariIdx !== 0 && !liburSet.has(isoStr)) efektif++;
    }
    hariEfektifPerBulan[`${b.tahun}-${b.bulan}`] = efektif;
  }

  // Group absensi: siswaId -> "tahun-bulan" -> { S, I, A }
  const absensiPerBulan: Record<string, Record<string, { S: number; I: number; A: number }>> = {};
  for (const a of absensiList) {
    const tgl = new Date(a.tanggal);
    const key = `${tgl.getFullYear()}-${tgl.getMonth() + 1}`;
    if (!absensiPerBulan[a.siswaId]) absensiPerBulan[a.siswaId] = {};
    if (!absensiPerBulan[a.siswaId][key]) absensiPerBulan[a.siswaId][key] = { S: 0, I: 0, A: 0 };
    if (a.status === "S") absensiPerBulan[a.siswaId][key].S++;
    else if (a.status === "I") absensiPerBulan[a.siswaId][key].I++;
    else if (a.status === "A") absensiPerBulan[a.siswaId][key].A++;
  }

  // Susun data siswa
  const siswaData = kelas.siswa.map((sk) => {
    const perBulan: Record<string, { S: number; I: number; A: number; efektif: number }> = {};
    let totalS = 0, totalI = 0, totalA = 0, totalEfektif = 0;

    for (const b of bulanList) {
      const key = `${b.tahun}-${b.bulan}`;
      const absen = absensiPerBulan[sk.siswa.id]?.[key] ?? { S: 0, I: 0, A: 0 };
      const efektif = hariEfektifPerBulan[key] ?? 0;
      perBulan[key] = { ...absen, efektif };
      totalS += absen.S;
      totalI += absen.I;
      totalA += absen.A;
      totalEfektif += efektif;
    }

    const totalHadir = totalEfektif - totalS - totalI - totalA;
    const persen = totalEfektif > 0 ? Math.round((totalHadir / totalEfektif) * 100) : 0;

    return {
      nomorAbsen: sk.nomorAbsen,
      nama: sk.siswa.nama,
      nis: sk.siswa.nis,
      perBulan,
      totalS, totalI, totalA,
      totalEfektif, totalHadir, persen,
    };
  });

  return { kelas, sekolah, semester, bulanList, siswaData, hariEfektifPerBulan };
}

export default async function RekapSemesterPage({
  searchParams,
}: {
  searchParams: Promise<{ kelasId?: string; semesterId?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || !user.sekolahId) redirect("/login");

  const params = await searchParams;
  const kelasId = params.kelasId ?? "";
  const semesterId = params.semesterId ?? "";

  if (!kelasId || !semesterId) redirect("/admin/rekap");

  const { kelas, sekolah, semester, bulanList, siswaData, hariEfektifPerBulan } = await getData(
    user.sekolahId, kelasId, semesterId
  );

  if (!kelas || !semester) redirect("/admin/rekap");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header nav */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Link
          href="/admin/rekap"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 13, color: "#6366f1", textDecoration: "none", fontWeight: 500,
          }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" width={14} height={14}>
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Kembali
        </Link>
        <span style={{ color: "#cbd5e1", fontSize: 13 }}>/</span>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
          Rekap Semester — {kelas.nama} — {semester.nama}
        </h1>
      </div>

      <RekapSemesterClient
        namaSekolah={sekolah?.nama ?? ""}
        alamatSekolah={sekolah?.alamat ?? ""}
        tahunAjaran={kelas.tahunAjaran.nama}
        namaKelas={kelas.nama}
        namaSemester={semester.nama}
        bulanList={bulanList}
        siswaData={siswaData ?? []}
        hariEfektifPerBulan={hariEfektifPerBulan ?? {}}
      />
    </div>
  );
}

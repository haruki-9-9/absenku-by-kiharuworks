import { getCurrentUser } from "@/lib/auth/get-current-user";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import RekapBulananClient from "@/app/admin/rekap/bulanan/RekapBulananClient";

const NAMA_BULAN = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export default async function WaliRekapBulananPage({
  searchParams,
}: {
  searchParams: Promise<{ bulan?: string; tahun?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "WALI_KELAS" || !user.sekolahId) redirect("/login");

  // Ambil kelas wali kelas ini
  const waliKelas = await prisma.waliKelas.findUnique({
    where: { userId: user.id },
    include: { kelas: true },
  });
  if (!waliKelas) redirect("/wali/rekap");

  const params = await searchParams;
  const bulan = parseInt(params.bulan ?? String(new Date().getMonth() + 1));
  const tahun = parseInt(params.tahun ?? String(new Date().getFullYear()));
  const kelasId = waliKelas.kelasId;
  const sekolahId = user.sekolahId;

  const startDate = new Date(tahun, bulan - 1, 1);
  const endDate = new Date(tahun, bulan, 0);

  const [kelas, sekolah, absensiList, hariLiburList] = await Promise.all([
    prisma.kelas.findFirst({
      where: { id: kelasId, sekolahId },
      include: {
        tahunAjaran: { select: { nama: true } },
        siswa: {
          orderBy: { nomorAbsen: "asc" },
          include: { siswa: { select: { id: true, nama: true, nis: true } } },
        },
      },
    }),
    prisma.sekolah.findUnique({ where: { id: sekolahId }, select: { nama: true, alamat: true } }),
    prisma.absensi.findMany({
      where: { sekolahId, kelasId, tanggal: { gte: startDate, lte: endDate } },
      select: { siswaId: true, tanggal: true, status: true },
    }),
    prisma.hariLibur.findMany({
      where: { sekolahId, tanggal: { gte: startDate, lte: endDate } },
      select: { tanggal: true, keterangan: true },
    }),
  ]);

  if (!kelas) redirect("/wali/rekap");

  const jumlahHari = new Date(tahun, bulan, 0).getDate();

  const absensiMap: Record<string, Record<number, string>> = {};
  for (const a of absensiList) {
    const tgl = new Date(a.tanggal).getDate();
    if (!absensiMap[a.siswaId]) absensiMap[a.siswaId] = {};
    absensiMap[a.siswaId][tgl] = a.status;
  }

  const liburMap: Record<number, string> = {};
  for (const h of hariLiburList) {
    liburMap[new Date(h.tanggal).getDate()] = h.keterangan;
  }

  let hariEfektif = 0;
  for (let d = 1; d <= jumlahHari; d++) {
    const hari = new Date(tahun, bulan - 1, d).getDay();
    if (hari !== 0 && !liburMap[d]) hariEfektif++;
  }

  const siswaData = kelas.siswa.map((sk) => {
    const absenSiswa = absensiMap[sk.siswa.id] ?? {};
    let totalS = 0, totalI = 0, totalA = 0, totalH = 0;
    for (let d = 1; d <= jumlahHari; d++) {
      const hari = new Date(tahun, bulan - 1, d).getDay();
      if (hari === 0 || liburMap[d]) continue;
      const status = absenSiswa[d];
      if (status === "S") totalS++;
      else if (status === "I") totalI++;
      else if (status === "A") totalA++;
      else totalH++;
    }
    return {
      nomorAbsen: sk.nomorAbsen, nama: sk.siswa.nama, nis: sk.siswa.nis,
      absen: absenSiswa, totalS, totalI, totalA, totalH,
      seharusnya: hariEfektif,
      realisasi: hariEfektif - totalS - totalI - totalA,
      persen: hariEfektif > 0 ? Math.round(((hariEfektif - totalS - totalI - totalA) / hariEfektif) * 100) : 0,
    };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Link href="/wali/rekap" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6366f1", textDecoration: "none", fontWeight: 500 }}>
          <svg viewBox="0 0 20 20" fill="currentColor" width={14} height={14}>
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Kembali
        </Link>
        <span style={{ color: "#cbd5e1", fontSize: 13 }}>/</span>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
          Rekap Bulanan — {kelas.nama} — {NAMA_BULAN[bulan]} {tahun}
        </h1>
      </div>

      <RekapBulananClient
        namaSekolah={sekolah?.nama ?? ""}
        alamatSekolah={sekolah?.alamat ?? ""}
        tahunAjaran={kelas.tahunAjaran.nama}
        namaKelas={kelas.nama}
        bulan={bulan}
        tahun={tahun}
        jumlahHari={jumlahHari}
        liburMap={liburMap}
        siswaData={siswaData}
      />
    </div>
  );
}

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import RekapBulananClient from "./RekapBulananClient";

const NAMA_BULAN = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

async function getData(sekolahId: string, kelasId: string, bulan: number, tahun: number) {
  const startDate = new Date(tahun, bulan - 1, 1);
  const endDate = new Date(tahun, bulan, 0); // hari terakhir bulan

  const [kelas, sekolah, absensiList, hariLiburList] = await Promise.all([
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
    prisma.absensi.findMany({
      where: {
        sekolahId,
        kelasId,
        tanggal: { gte: startDate, lte: endDate },
      },
      select: { siswaId: true, tanggal: true, status: true },
    }),
    prisma.hariLibur.findMany({
      where: {
        sekolahId,
        tanggal: { gte: startDate, lte: endDate },
      },
      select: { tanggal: true, keterangan: true },
    }),
  ]);

  return { kelas, sekolah, absensiList, hariLiburList };
}

export default async function RekapBulananPage({
  searchParams,
}: {
  searchParams: Promise<{ kelasId?: string; bulan?: string; tahun?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || !user.sekolahId) redirect("/login");

  const params = await searchParams;
  const kelasId = params.kelasId ?? "";
  const bulan = parseInt(params.bulan ?? String(new Date().getMonth() + 1));
  const tahun = parseInt(params.tahun ?? String(new Date().getFullYear()));

  if (!kelasId) redirect("/admin/rekap");

  const { kelas, sekolah, absensiList, hariLiburList } = await getData(
    user.sekolahId, kelasId, bulan, tahun
  );

  if (!kelas) redirect("/admin/rekap");

  const jumlahHari = new Date(tahun, bulan, 0).getDate();

  // Map absensi: siswaId -> tanggal(1-31) -> status
  const absensiMap: Record<string, Record<number, string>> = {};
  for (const a of absensiList) {
    const tgl = new Date(a.tanggal).getDate();
    if (!absensiMap[a.siswaId]) absensiMap[a.siswaId] = {};
    absensiMap[a.siswaId][tgl] = a.status;
  }

  // Map hari libur: tanggal(1-31) -> keterangan
  const liburMap: Record<number, string> = {};
  for (const h of hariLiburList) {
    const tgl = new Date(h.tanggal).getDate();
    liburMap[tgl] = h.keterangan;
  }

  // Hitung hari efektif (non-minggu, non-libur)
  let hariEfektif = 0;
  for (let d = 1; d <= jumlahHari; d++) {
    const hari = new Date(tahun, bulan - 1, d).getDay();
    if (hari !== 0 && !liburMap[d]) hariEfektif++;
  }

  // Susun data siswa
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
      else totalH++; // H atau belum diisi (dianggap H)
    }

    return {
      nomorAbsen: sk.nomorAbsen,
      nama: sk.siswa.nama,
      nis: sk.siswa.nis,
      absen: absenSiswa,
      totalS, totalI, totalA, totalH,
      seharusnya: hariEfektif,
      realisasi: hariEfektif - totalS - totalI - totalA,
      persen: hariEfektif > 0
        ? Math.round(((hariEfektif - totalS - totalI - totalA) / hariEfektif) * 100)
        : 0,
    };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
            Rekap Bulanan — {kelas.nama} — {NAMA_BULAN[bulan]} {tahun}
          </h1>
        </div>
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

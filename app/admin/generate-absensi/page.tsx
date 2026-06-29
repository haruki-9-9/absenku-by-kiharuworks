import { getCurrentUser } from "@/lib/auth/get-current-user";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import GenerateAbsensiClient from "./GenerateAbsensiClient";

export default async function GenerateAbsensiPage({
  searchParams,
}: {
  searchParams: Promise<{ kelasId?: string; tanggalMulai?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || !user.sekolahId) redirect("/login");
  if (user.role !== "ADMIN_SEKOLAH") redirect("/admin");

  const params = await searchParams;

  const [kelasList, sekolah] = await Promise.all([
    prisma.kelas.findMany({
      where: { sekolahId: user.sekolahId, isActive: true },
      include: {
        tahunAjaran: { select: { nama: true } },
        waliKelas: { include: { user: { select: { name: true } } } },
        siswa: {
          orderBy: { nomorAbsen: "asc" },
          include: { siswa: { select: { id: true, nama: true, jenisKelamin: true } } },
        },
      },
      orderBy: { nama: "asc" },
    }),
    prisma.sekolah.findUnique({
      where: { id: user.sekolahId },
      select: { nama: true, alamat: true },
    }),
  ]);

  const selectedKelas = params.kelasId
    ? kelasList.find((k: typeof kelasList[number]) => k.id === params.kelasId) ?? null
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Link
          href="/admin"
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
          Generate Form Absensi Harian
        </h1>
      </div>

      <GenerateAbsensiClient
        kelasList={kelasList.map((k) => ({
          id: k.id,
          nama: k.nama,
          programKeahlian: k.programKeahlian ?? null,
          tahunAjaran: k.tahunAjaran.nama,
          namaWaliKelas: k.waliKelas?.user.name ?? null,
          siswa: k.siswa.map((sk) => ({
            nama: sk.siswa.nama,
            jenisKelamin: sk.siswa.jenisKelamin,
            nomorAbsen: sk.nomorAbsen,
          })),
        }))}
        namaSekolah={sekolah?.nama ?? ""}
        alamatSekolah={sekolah?.alamat ?? ""}
        defaultKelasId={params.kelasId ?? ""}
        defaultTanggalMulai={params.tanggalMulai ?? ""}
      />
    </div>
  );
}

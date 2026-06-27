import { getCurrentUser } from "@/lib/auth/get-current-user";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { isJamLockTerlewati, getTanggalHariIni } from "@/lib/sekretaris/check-jam-lock";
import AbsensiList from "./AbsensiList";

async function getData(userId: string, sekolahId: string) {
  const sekretaris = await prisma.sekretaris.findUnique({
    where: { userId },
    include: { kelas: { select: { id: true, nama: true } } },
  });

  if (!sekretaris) return null;

  const konfigurasi = await prisma.konfigurasiSekolah.findUnique({
    where: { sekolahId },
  });
  const jamLock = konfigurasi?.jamLock ?? "15:00";
  const zonaWaktu = konfigurasi?.zonaWaktu ?? "Asia/Jakarta";
  const tanggalHariIni = getTanggalHariIni(zonaWaktu);
  const terkunci = isJamLockTerlewati(jamLock, zonaWaktu);

  const siswaKelas = await prisma.siswaKelas.findMany({
    where: { kelasId: sekretaris.kelasId, tanggalKeluar: null, siswa: { isActive: true } },
    orderBy: { nomorAbsen: "asc" },
    include: { siswa: { select: { id: true, nama: true, nis: true, jenisKelamin: true } } },
  });

  const absensiHariIni = await prisma.absensi.findMany({
    where: { kelasId: sekretaris.kelasId, tanggal: tanggalHariIni },
  });

  type AbsensiRow = { siswaId: string; status: "H" | "S" | "I" | "A"; keterangan: string | null };
  const absensiMap = new Map<string, AbsensiRow>(
    absensiHariIni.map((a) => [a.siswaId, a as AbsensiRow])
  );

  const siswaList = siswaKelas.map((sk) => sk.siswa);

  return {
    namaKelas: sekretaris.kelas.nama,
    jamLock,
    terkunci,
    siswaList,
    absensiMap,
  };
}

export default async function SekretarisPage() {
  const user = await getCurrentUser();
  if (!user || !user.sekolahId) redirect("/login");

  const data = await getData(user.id, user.sekolahId);

  const hariIni = new Intl.DateTimeFormat("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  }).format(new Date());

  if (!data) {
    return (
      <div style={{
        background: "rgba(255,255,255,0.65)", backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)", border: "0.5px solid rgba(255,255,255,0.9)",
        borderRadius: 20, padding: 48, textAlign: "center",
      }}>
        <p style={{ fontSize: 13, color: "#94a3b8" }}>
          Akun Anda belum ditugaskan ke kelas manapun. Hubungi admin sekolah.
        </p>
      </div>
    );
  }

  const absensiAwal = Object.fromEntries(
    data.siswaList.map((s) => {
      const a = data.absensiMap.get(s.id);
      return [s.id, { status: a?.status ?? "H", keterangan: a?.keterangan ?? "" }];
    })
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 720 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
            Absensi Kelas {data.namaKelas}
          </h1>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 2, textTransform: "capitalize" }}>
            {hariIni}
          </p>
        </div>

        <div
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600,
            background: data.terkunci ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.08)",
            color: data.terkunci ? "#dc2626" : "#059669",
            border: `0.5px solid ${data.terkunci ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)"}`,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: data.terkunci ? "#ef4444" : "#10b981" }} />
          {data.terkunci ? `Terkunci sejak ${data.jamLock}` : `Bisa diisi sampai ${data.jamLock}`}
        </div>
      </div>

      {data.siswaList.length === 0 ? (
        <div style={{
          background: "rgba(255,255,255,0.65)", backdropFilter: "blur(24px)",
          border: "0.5px solid rgba(255,255,255,0.9)", borderRadius: 20,
          padding: 48, textAlign: "center",
        }}>
          <p style={{ fontSize: 13, color: "#94a3b8" }}>Belum ada siswa di kelas ini.</p>
        </div>
      ) : (
        <AbsensiList siswaList={data.siswaList} absensiAwal={absensiAwal} terkunci={data.terkunci} />
      )}
    </div>
  );
}

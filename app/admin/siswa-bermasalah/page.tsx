import { getCurrentUser } from "@/lib/auth/get-current-user";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function SiswaBermasalahPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN_SEKOLAH" || !user.sekolahId) redirect("/login");

  const sekolahId = user.sekolahId;

  // Ambil konfigurasi batasAlpa
  const konfigurasi = await prisma.konfigurasiSekolah.findUnique({
    where: { sekolahId },
    select: { batasAlpa: true },
  });

  const batasAlpa = konfigurasi?.batasAlpa ?? 3;

  // Ambil semester aktif (yang tanggalSelesai >= hari ini)
  const sekarang = new Date();
  const semesterList = await prisma.semester.findMany({
    where: {
      tahunAjaran: { sekolahId },
      tanggalMulai: { lte: sekarang },
      tanggalSelesai: { gte: sekarang },
    },
    include: { tahunAjaran: { select: { nama: true } } },
    orderBy: { tanggalMulai: "desc" },
  });

  // Jika tidak ada semester aktif, ambil semester terakhir
  const semester = semesterList[0] ?? await prisma.semester.findFirst({
    where: { tahunAjaran: { sekolahId } },
    include: { tahunAjaran: { select: { nama: true } } },
    orderBy: { tanggalSelesai: "desc" },
  });

  if (!semester) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
            Siswa Bermasalah
          </h1>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
            Siswa dengan alpa melebihi batas yang ditentukan.
          </p>
        </div>
        <div style={{
          background: "rgba(255,255,255,0.65)", backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)", border: "0.5px solid rgba(255,255,255,0.9)",
          borderRadius: 20, boxShadow: "0 8px 32px rgba(99,102,241,0.08)",
          padding: 48, textAlign: "center",
        }}>
          <p style={{ fontSize: 13, color: "#94a3b8" }}>Belum ada semester yang dikonfigurasi.</p>
        </div>
      </div>
    );
  }

  // Hitung total alpa per siswa di semester ini
  const absensiAlpa = await prisma.absensi.groupBy({
    by: ["siswaId", "kelasId"],
    where: {
      sekolahId,
      status: "A",
      tanggal: {
        gte: semester.tanggalMulai,
        lte: semester.tanggalSelesai,
      },
    },
    _count: { status: true },
    having: { status: { _count: { gte: batasAlpa } } },
    orderBy: { _count: { status: "desc" } },
  });

  // Ambil detail siswa + kelas
  const siswaIds = absensiAlpa.map((a) => a.siswaId);
  const kelasIds = absensiAlpa.map((a) => a.kelasId);

  const [siswaList, kelasList] = await Promise.all([
    prisma.siswa.findMany({
      where: { id: { in: siswaIds } },
      select: { id: true, nama: true, nis: true },
    }),
    prisma.kelas.findMany({
      where: { id: { in: kelasIds } },
      select: { id: true, nama: true },
    }),
  ]);

  const siswaMap = new Map(siswaList.map((s) => [s.id, s]));
  const kelasMap = new Map(kelasList.map((k) => [k.id, k]));

  const data = absensiAlpa.map((a) => ({
    siswa: siswaMap.get(a.siswaId),
    kelas: kelasMap.get(a.kelasId),
    totalAlpa: a._count.status,
  })).filter((d) => d.siswa && d.kelas);

  const cardStyle = {
    background: "rgba(255,255,255,0.65)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "0.5px solid rgba(255,255,255,0.9)",
    borderRadius: 20,
    boxShadow: "0 8px 32px rgba(99,102,241,0.08)",
  };

  return (
    <>
      <style>{`.siswa-row:hover { background: rgba(239,68,68,0.03) !important; }
        @media (max-width: 768px) {
          .bermasalah-stat-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .bermasalah-table-wrap { display: none !important; }
          .bermasalah-cards { display: flex !important; }
        }
        @media (min-width: 769px) {
          .bermasalah-cards { display: none !important; }
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
              Siswa Bermasalah
            </h1>
            <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
              Semester: <strong>{semester.nama}</strong> — {semester.tahunAjaran.nama}
            </p>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 16px", borderRadius: 12,
            background: "rgba(239,68,68,0.08)",
            border: "0.5px solid rgba(239,68,68,0.2)",
          }}>
            <svg viewBox="0 0 20 20" fill="#dc2626" width={14} height={14}>
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#dc2626" }}>
              Batas Alpa: {batasAlpa}x
            </span>
          </div>
        </div>

        {/* Stat cards */}
        <div className="bermasalah-stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { label: "Total Siswa Bermasalah", value: data.length, color: "#dc2626", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.15)" },
            { label: "Batas Alpa", value: `${batasAlpa}x`, color: "#b45309", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.15)" },
            { label: "Alpa Tertinggi", value: data[0]?.totalAlpa ?? 0, color: "#7c3aed", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.15)" },
          ].map((s) => (
            <div key={s.label} style={{ ...cardStyle, padding: "16px 20px", background: s.bg, border: `0.5px solid ${s.border}` }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: s.color, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {s.label}
              </p>
              <p style={{ fontSize: 28, fontWeight: 800, color: s.color, marginTop: 4 }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Tabel */}
        <div className="bermasalah-table-wrap" style={{ ...cardStyle, overflow: "hidden" }}>
          {data.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center" }}>
              <p style={{ fontSize: 20, marginBottom: 8 }}>🎉</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>Tidak ada siswa bermasalah</p>
              <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                Semua siswa masih di bawah batas alpa {batasAlpa}x.
              </p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "0.5px solid rgba(0,0,0,0.06)" }}>
                  {["No", "Nama Siswa", "NIS", "Kelas", "Total Alpa", "Status"].map((h) => (
                    <th key={h} style={{
                      padding: "12px 20px", textAlign: "left",
                      fontSize: 10, fontWeight: 700, color: "#94a3b8",
                      letterSpacing: "0.08em", textTransform: "uppercase",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((d, i) => {
                  const level = d.totalAlpa >= batasAlpa * 2
                    ? { color: "#7c3aed", bg: "rgba(139,92,246,0.1)", label: "Kritis" }
                    : { color: "#dc2626", bg: "rgba(239,68,68,0.1)", label: "Peringatan" };

                  return (
                    <tr key={`${d.siswa!.id}-${d.kelas!.id}`} className="siswa-row" style={{
                      borderBottom: i < data.length - 1 ? "0.5px solid rgba(0,0,0,0.04)" : "none",
                      transition: "background 0.15s",
                    }}>
                      <td style={{ padding: "13px 20px", fontSize: 12, color: "#94a3b8", width: 40 }}>
                        {i + 1}
                      </td>
                      <td style={{ padding: "13px 20px", fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                        {d.siswa!.nama}
                      </td>
                      <td style={{ padding: "13px 20px", fontSize: 12, color: "#64748b" }}>
                        {d.siswa!.nis}
                      </td>
                      <td style={{ padding: "13px 20px" }}>
                        <span style={{
                          padding: "3px 10px", borderRadius: 6,
                          fontSize: 11, fontWeight: 600,
                          background: "rgba(99,102,241,0.08)", color: "#6366f1",
                        }}>
                          {d.kelas!.nama}
                        </span>
                      </td>
                      <td style={{ padding: "13px 20px" }}>
                        <span style={{
                          fontSize: 16, fontWeight: 800, color: level.color,
                        }}>
                          {d.totalAlpa}x
                        </span>
                      </td>
                      <td style={{ padding: "13px 20px" }}>
                        <span style={{
                          padding: "3px 10px", borderRadius: 6,
                          fontSize: 11, fontWeight: 700,
                          background: level.bg, color: level.color,
                        }}>
                          {level.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Mobile card view */}
        <div className="bermasalah-cards" style={{ flexDirection: "column", gap: 10, display: "none" }}>
          {data.length === 0 ? (
            <div style={{ ...cardStyle, padding: 32, textAlign: "center" }}>
              <p style={{ fontSize: 20, marginBottom: 8 }}>🎉</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>Tidak ada siswa bermasalah</p>
              <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Semua siswa masih di bawah batas alpa {batasAlpa}x.</p>
            </div>
          ) : data.map((d, i) => {
            const level = d.totalAlpa >= batasAlpa * 2
              ? { color: "#7c3aed", bg: "rgba(139,92,246,0.1)", label: "Kritis" }
              : { color: "#dc2626", bg: "rgba(239,68,68,0.1)", label: "Peringatan" };
            return (
              <div key={`${d.siswa!.id}-${d.kelas!.id}`} style={{
                ...cardStyle, padding: "14px 16px",
                borderRadius: 16, boxShadow: "0 4px 16px rgba(99,102,241,0.06)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 2 }}>#{i + 1}</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{d.siswa!.nama}</p>
                    <p style={{ fontSize: 12, color: "#64748b" }}>{d.siswa!.nis}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 22, fontWeight: 800, color: level.color }}>{d.totalAlpa}x</p>
                    <span style={{ padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: level.bg, color: level.color }}>
                      {level.label}
                    </span>
                  </div>
                </div>
                <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: "rgba(99,102,241,0.08)", color: "#6366f1" }}>
                  {d.kelas!.nama}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

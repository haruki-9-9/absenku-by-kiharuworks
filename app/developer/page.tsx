import { prisma } from "@/lib/prisma";

async function getOverviewData() {
  const [
    totalSekolah,
    sekolahAktif,
    sekolahExpired,
    sekolahNonaktif,
    totalUser,
    sekolahMauHabis,
  ] = await Promise.all([
    prisma.sekolah.count(),
    prisma.langganan.count({ where: { status: "AKTIF" } }),
    prisma.langganan.count({ where: { status: "EXPIRED" } }),
    prisma.langganan.count({ where: { status: "NONAKTIF" } }),
    prisma.user.count({ where: { role: { not: "DEVELOPER" } } }),
    prisma.langganan.findMany({
      where: {
        status: "AKTIF",
        tanggalBerakhir: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          gte: new Date(),
        },
      },
      include: { sekolah: { select: { nama: true } } },
      orderBy: { tanggalBerakhir: "asc" },
    }),
  ]);

  return {
    totalSekolah,
    sekolahAktif,
    sekolahExpired,
    sekolahNonaktif,
    totalUser,
    sekolahMauHabis,
  };
}

function StatCard({
  label,
  value,
  color,
  bg,
}: {
  label: string;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.65)", backdropFilter: "blur(24px)",
      border: "0.5px solid rgba(255,255,255,0.9)", borderRadius: 20,
      padding: "20px 24px", boxShadow: "0 8px 32px rgba(99,102,241,0.08)",
    }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.12em", textTransform: "uppercase" }}>
        {label}
      </p>
      <p style={{ marginTop: 8, fontSize: 36, fontWeight: 800, color, letterSpacing: "-1px", lineHeight: 1 }}>
        {value}
      </p>
    </div>
  );
}

function getDaysLeft(date: Date) {
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default async function DeveloperPage() {
  const data = await getOverviewData();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Page title */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>Overview</h1>
        <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>Ringkasan seluruh data absenku.</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <StatCard label="Total Sekolah" value={data.totalSekolah} color="#0f172a" bg="" />
        <StatCard label="Langganan Aktif" value={data.sekolahAktif} color="#22c55e" bg="" />
        <StatCard label="Expired" value={data.sekolahExpired} color="#ef4444" bg="" />
        <StatCard label="Total User" value={data.totalUser} color="#6366f1" bg="" />
      </div>

      {/* Langganan mau habis */}
      <div style={{
        background: "rgba(255,255,255,0.65)", backdropFilter: "blur(24px)",
        border: "0.5px solid rgba(255,255,255,0.9)", borderRadius: 20,
        boxShadow: "0 8px 32px rgba(99,102,241,0.08)", overflow: "hidden",
      }}>
        <div style={{ padding: "16px 24px", borderBottom: "0.5px solid rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Langganan Mau Habis</h2>
          <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Sekolah dengan langganan berakhir dalam 30 hari ke depan.</p>
        </div>

        {data.sekolahMauHabis.length === 0 ? (
          <div style={{ padding: "40px 24px", textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "#94a3b8" }}>Tidak ada langganan yang mau habis dalam 30 hari.</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "0.5px solid rgba(0,0,0,0.06)" }}>
                {["Sekolah", "Berakhir", "Sisa"].map((h) => (
                  <th key={h} style={{ padding: "10px 24px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.sekolahMauHabis.map((item) => {
                const daysLeft = getDaysLeft(item.tanggalBerakhir);
                return (
                  <tr key={item.id} style={{ borderBottom: "0.5px solid rgba(0,0,0,0.04)" }}>
                    <td style={{ padding: "12px 24px", fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{item.sekolah.nama}</td>
                    <td style={{ padding: "12px 24px", fontSize: 13, color: "#64748b" }}>
                      {new Date(item.tanggalBerakhir).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </td>
                    <td style={{ padding: "12px 24px" }}>
                      <span style={{
                        display: "inline-flex", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                        background: daysLeft <= 7 ? "rgba(239,68,68,0.12)" : "rgba(245,158,11,0.12)",
                        color: daysLeft <= 7 ? "#dc2626" : "#d97706",
                      }}>
                        {daysLeft} hari
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

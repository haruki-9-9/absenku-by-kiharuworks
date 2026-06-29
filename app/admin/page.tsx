import { getCurrentUser } from "@/lib/auth/get-current-user";
import OverviewKehadiranWidget from "./OverviewKehadiranWidget";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

async function getAdminData(sekolahId: string) {
  const [
    totalKelas,
    kelasAktif,
    totalSiswa,
    siswaAktif,
    totalPengguna,
    langganan,
    absensiHariIni,
  ] = await Promise.all([
    prisma.kelas.count({ where: { sekolahId } }),
    prisma.kelas.count({ where: { sekolahId, isActive: true } }),
    prisma.siswa.count({ where: { sekolahId } }),
    prisma.siswa.count({ where: { sekolahId, isActive: true } }),
    prisma.user.count({
      where: {
        sekolahId,
        role: { in: ["SEKRETARIS", "WALI_KELAS"] },
        isActive: true,
      },
    }),
    prisma.langganan.findUnique({ where: { sekolahId } }),
    prisma.absensi.count({
      where: {
        sekolahId,
        tanggal: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),
  ]);

  return {
    totalKelas,
    kelasAktif,
    totalSiswa,
    siswaAktif,
    totalPengguna,
    langganan,
    absensiHariIni,
  };
}

function StatCard({
  label,
  value,
  sub,
  color,
  icon,
}: {
  label: string;
  value: number | string;
  sub?: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="stat-card-item"
      style={{
        background: "rgba(255,255,255,0.65)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "0.5px solid rgba(255,255,255,0.9)",
        borderRadius: 20,
        padding: "20px 24px",
        boxShadow: "0 8px 32px rgba(99,102,241,0.08)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: `${color}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color,
        }}
      >
        {icon}
      </div>
      <div>
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#94a3b8",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </p>
        <p
          className="stat-value-lg"
          style={{
            marginTop: 4,
            fontSize: 32,
            fontWeight: 800,
            color,
            letterSpacing: "-1px",
            lineHeight: 1,
          }}
        >
          {value}
        </p>
        {sub && (
          <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{sub}</p>
        )}
      </div>
    </div>
  );
}

function getDaysLeft(date: Date) {
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

const paketLabel: Record<string, string> = {
  STARTER: "Starter",
  BASIC: "Basic",
  PRO: "Pro",
  ENTERPRISE: "Enterprise",
};

const statusColor: Record<string, string> = {
  AKTIF: "#10b981",
  EXPIRED: "#ef4444",
  NONAKTIF: "#94a3b8",
};

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || !user.sekolahId) redirect("/login");

  const data = await getAdminData(user.sekolahId);
  const { langganan } = data;
  const daysLeft = langganan ? getDaysLeft(langganan.tanggalBerakhir) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Page title */}
      <div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#0f172a",
            letterSpacing: "-0.5px",
          }}
        >
          Overview
        </h1>
        <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
          Ringkasan data sekolah Anda.
        </p>
      </div>

      {/* Stat cards */}
      <div className="stat-grid-4">
        <StatCard
          label="Total Kelas"
          value={data.kelasAktif}
          sub={`${data.totalKelas} total (termasuk nonaktif)`}
          color="#6366f1"
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor" width={20} height={20}>
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
          }
        />
        <StatCard
          label="Siswa Aktif"
          value={data.siswaAktif}
          sub={`${data.totalSiswa} total terdaftar`}
          color="#8b5cf6"
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor" width={20} height={20}>
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
          }
        />
        <StatCard
          label="Pengguna"
          value={data.totalPengguna}
          sub="Sekretaris & Wali Kelas aktif"
          color="#ec4899"
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor" width={20} height={20}>
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                clipRule="evenodd"
              />
            </svg>
          }
        />
        <StatCard
          label="Absensi Hari Ini"
          value={data.absensiHariIni}
          sub="Total entri absensi hari ini"
          color="#0ea5e9"
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor" width={20} height={20}>
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              />
            </svg>
          }
        />
      </div>

      {/* Widget kehadiran real-time */}
      <OverviewKehadiranWidget />

      {/* Langganan info */}
      {langganan && (
        <div
          style={{
            background: "rgba(255,255,255,0.65)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "0.5px solid rgba(255,255,255,0.9)",
            borderRadius: 20,
            padding: "20px 24px",
            boxShadow: "0 8px 32px rgba(99,102,241,0.08)",
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#94a3b8",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Info Langganan
          </p>
          <div className="info-grid-4">
            {[
              {
                label: "Paket",
                value: paketLabel[langganan.paket] || langganan.paket,
                color: "#6366f1",
              },
              {
                label: "Status",
                value: langganan.status,
                color: statusColor[langganan.status] || "#94a3b8",
              },
              {
                label: "Maks. Kelas",
                value: `${data.kelasAktif} / ${langganan.maxKelas}`,
                color: "#0f172a",
              },
              {
                label: "Sisa Hari",
                value:
                  daysLeft > 0
                    ? `${daysLeft} hari`
                    : "Habis",
                color: daysLeft <= 7 ? "#ef4444" : daysLeft <= 30 ? "#f59e0b" : "#10b981",
              },
            ].map((item) => (
              <div key={item.label}>
                <p
                  style={{
                    fontSize: 11,
                    color: "#94a3b8",
                    fontWeight: 500,
                    marginBottom: 4,
                  }}
                >
                  {item.label}
                </p>
                <p
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: item.color,
                  }}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>
          {daysLeft <= 30 && daysLeft > 0 && (
            <div
              style={{
                marginTop: 16,
                padding: "10px 14px",
                background: "rgba(245,158,11,0.08)",
                borderRadius: 10,
                border: "0.5px solid rgba(245,158,11,0.2)",
              }}
            >
              <p style={{ fontSize: 12, color: "#b45309" }}>
                ⚠️ Langganan Anda akan habis dalam {daysLeft} hari. Hubungi KiharuWorks untuk perpanjangan.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

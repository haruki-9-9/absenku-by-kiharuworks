import { getCurrentUser } from "@/lib/auth/get-current-user";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { togglePenggunaAction } from "./actions";

async function getPenggunaData(sekolahId: string) {
  return prisma.user.findMany({
    where: {
      sekolahId,
      role: { in: ["SEKRETARIS", "WALI_KELAS"] },
    },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    include: {
      sekretaris: {
        include: { kelas: { select: { nama: true } } },
      },
    },
  });
}

const roleLabel: Record<string, string> = {
  SEKRETARIS: "Petugas Absensi",
  WALI_KELAS: "Wali Kelas",
};

const roleColor: Record<string, { bg: string; color: string }> = {
  SEKRETARIS: { bg: "rgba(14,165,233,0.1)", color: "#0ea5e9" },
  WALI_KELAS: { bg: "rgba(139,92,246,0.1)", color: "#8b5cf6" },
};

export default async function PenggunaPage() {
  const user = await getCurrentUser();
  if (!user || !user.sekolahId) redirect("/login");

  const penggunaList = await getPenggunaData(user.sekolahId);
  const totalAktif = penggunaList.filter((p) => p.isActive).length;

  return (
    <>
      <style>{`
        .pengguna-row:hover { background: rgba(99,102,241,0.04) !important; }
        .btn-toggle:hover { opacity: 0.8; }
        .btn-tambah:hover { opacity: 0.9; transform: translateY(-1px); }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
              Kelola Pengguna
            </h1>
            <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
              {totalAktif} pengguna aktif dari {penggunaList.length} total
            </p>
          </div>
          <Link
            href="/admin/pengguna/tambah"
            className="btn-tambah"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600,
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              color: "#fff", textDecoration: "none",
              boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
              transition: "all 0.2s",
            }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width={16} height={16}>
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Tambah Pengguna
          </Link>
        </div>

        {/* Tabel */}
        <div style={{
          background: "rgba(255,255,255,0.65)", backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)", border: "0.5px solid rgba(255,255,255,0.9)",
          borderRadius: 20, boxShadow: "0 8px 32px rgba(99,102,241,0.08)", overflow: "hidden",
        }}>
          {penggunaList.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "#94a3b8" }}>Belum ada pengguna. Tambah pengguna pertama.</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "0.5px solid rgba(0,0,0,0.06)" }}>
                  {["Nama", "Email", "Role", "Kelas", "Status", "Aksi"].map((h) => (
                    <th key={h} style={{
                      padding: "14px 20px", textAlign: "left",
                      fontSize: 10, fontWeight: 700, color: "#94a3b8",
                      letterSpacing: "0.1em", textTransform: "uppercase",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {penggunaList.map((pengguna) => {
                  const rc = roleColor[pengguna.role] ?? { bg: "rgba(148,163,184,0.1)", color: "#94a3b8" };
                  return (
                    <tr
                      key={pengguna.id}
                      className="pengguna-row"
                      style={{ borderBottom: "0.5px solid rgba(0,0,0,0.04)", transition: "background 0.15s" }}
                    >
                      <td style={{ padding: "14px 20px" }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{pengguna.name}</p>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <p style={{ fontSize: 12, color: "#64748b" }}>{pengguna.email}</p>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{
                          padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                          background: rc.bg, color: rc.color,
                        }}>
                          {roleLabel[pengguna.role] ?? pengguna.role}
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        {pengguna.sekretaris?.kelas.nama ? (
                          <span style={{
                            padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                            background: "rgba(99,102,241,0.08)", color: "#6366f1",
                          }}>
                            {pengguna.sekretaris.kelas.nama}
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                          background: pengguna.isActive ? "rgba(16,185,129,0.1)" : "rgba(148,163,184,0.15)",
                          color: pengguna.isActive ? "#059669" : "#94a3b8",
                        }}>
                          <span style={{
                            width: 5, height: 5, borderRadius: "50%",
                            background: pengguna.isActive ? "#10b981" : "#94a3b8",
                          }} />
                          {pengguna.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <form action={async () => {
                          "use server";
                          await togglePenggunaAction(pengguna.id, !pengguna.isActive);
                        }}>
                          <button
                            type="submit"
                            className="btn-toggle"
                            style={{
                              padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500,
                              border: "0.5px solid",
                              borderColor: pengguna.isActive ? "rgba(239,68,68,0.3)" : "rgba(99,102,241,0.3)",
                              background: pengguna.isActive ? "rgba(239,68,68,0.06)" : "rgba(99,102,241,0.06)",
                              color: pengguna.isActive ? "#ef4444" : "#6366f1",
                              cursor: "pointer", transition: "all 0.2s",
                            }}
                          >
                            {pengguna.isActive ? "Nonaktifkan" : "Aktifkan"}
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

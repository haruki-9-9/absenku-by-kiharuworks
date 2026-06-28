import { getCurrentUser } from "@/lib/auth/get-current-user";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { toggleSiswaAction } from "./actions";

async function getSiswaData(sekolahId: string) {
  const [siswaList, kelasList] = await Promise.all([
    prisma.siswa.findMany({
      where: { sekolahId },
      orderBy: [{ isActive: "desc" }, { nama: "asc" }],
      include: {
        kelas: {
          where: { tanggalKeluar: null },
          include: { kelas: { select: { id: true, nama: true } } },
        },
      },
    }),
    prisma.kelas.findMany({
      where: { sekolahId, isActive: true },
      orderBy: { nama: "asc" },
    }),
  ]);

  return { siswaList, kelasList };
}

export default async function SiswaPage() {
  const user = await getCurrentUser();
  if (!user || !user.sekolahId) redirect("/login");

  const { siswaList, kelasList } = await getSiswaData(user.sekolahId);
  const totalAktif = siswaList.filter((s) => s.isActive).length;

  return (
    <>
      <style>{`
        .siswa-row:hover { background: rgba(99,102,241,0.04) !important; }
        .btn-toggle:hover { opacity: 0.8; }
        .btn-tambah:hover { opacity: 0.9; transform: translateY(-1px); }
        @media (max-width: 768px) {
          .siswa-header { flex-direction: column !important; gap: 12px !important; }
          .siswa-header-btns { width: 100%; justify-content: stretch !important; }
          .siswa-header-btns a { flex: 1; justify-content: center; }
          .siswa-table-wrap { display: none !important; }
          .siswa-cards { display: flex !important; }
        }
        @media (min-width: 769px) {
          .siswa-cards { display: none !important; }
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Header */}
        <div className="siswa-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
              Kelola Siswa
            </h1>
            <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
              {totalAktif} siswa aktif dari {siswaList.length} total terdaftar
            </p>
          </div>
          <div className="siswa-header-btns" style={{ display: "flex", gap: 10 }}>
            <Link
              href="/admin/siswa/import"
              className="btn-toggle"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "10px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600,
                background: "rgba(99,102,241,0.06)",
                border: "0.5px solid rgba(99,102,241,0.3)",
                color: "#6366f1", textDecoration: "none",
                transition: "all 0.2s",
              }}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" width={16} height={16}>
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Import Excel
            </Link>
            <Link
              href="/admin/siswa/tambah"
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
              Tambah Siswa
            </Link>
          </div>
        </div>

        {/* Tabel */}
        <div className="siswa-table-wrap" style={{
          background: "rgba(255,255,255,0.65)", backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)", border: "0.5px solid rgba(255,255,255,0.9)",
          borderRadius: 20, boxShadow: "0 8px 32px rgba(99,102,241,0.08)", overflow: "hidden",
        }}>
          {siswaList.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "#94a3b8" }}>Belum ada siswa terdaftar.</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "0.5px solid rgba(0,0,0,0.06)" }}>
                  {["NIS", "Nama", "L/P", "Kelas", "Status", "Aksi"].map((h) => (
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
                {siswaList.map((siswa) => {
                  const kelasAktif = siswa.kelas[0]?.kelas?.nama ?? null;
                  return (
                    <tr
                      key={siswa.id}
                      className="siswa-row"
                      style={{ borderBottom: "0.5px solid rgba(0,0,0,0.04)", transition: "background 0.15s" }}
                    >
                      <td style={{ padding: "14px 20px" }}>
                        <p style={{ fontSize: 12, fontFamily: "monospace", color: "#6366f1", fontWeight: 600 }}>
                          {siswa.nis}
                        </p>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{siswa.nama}</p>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          width: 24, height: 24, borderRadius: 6, fontSize: 11, fontWeight: 700,
                          background: siswa.jenisKelamin === "L" ? "rgba(14,165,233,0.1)" : "rgba(236,72,153,0.1)",
                          color: siswa.jenisKelamin === "L" ? "#0ea5e9" : "#ec4899",
                        }}>
                          {siswa.jenisKelamin}
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        {kelasAktif ? (
                          <span style={{
                            padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                            background: "rgba(99,102,241,0.08)", color: "#6366f1",
                          }}>
                            {kelasAktif}
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>
                            Belum di kelas
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                          background: siswa.isActive ? "rgba(16,185,129,0.1)" : "rgba(148,163,184,0.15)",
                          color: siswa.isActive ? "#059669" : "#94a3b8",
                        }}>
                          <span style={{
                            width: 5, height: 5, borderRadius: "50%",
                            background: siswa.isActive ? "#10b981" : "#94a3b8",
                          }} />
                          {siswa.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <form action={async () => {
                          "use server";
                          await toggleSiswaAction(siswa.id, !siswa.isActive);
                        }}>
                          <button
                            type="submit"
                            className="btn-toggle"
                            style={{
                              padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500,
                              border: "0.5px solid",
                              borderColor: siswa.isActive ? "rgba(239,68,68,0.3)" : "rgba(99,102,241,0.3)",
                              background: siswa.isActive ? "rgba(239,68,68,0.06)" : "rgba(99,102,241,0.06)",
                              color: siswa.isActive ? "#ef4444" : "#6366f1",
                              cursor: "pointer", transition: "all 0.2s",
                            }}
                          >
                            {siswa.isActive ? "Nonaktifkan" : "Aktifkan"}
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

        {/* Mobile card view */}
        <div className="siswa-cards" style={{ flexDirection: "column", gap: 10, display: "none" }}>
          {siswaList.length === 0 ? (
            <div style={{
              background: "rgba(255,255,255,0.65)", backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)", border: "0.5px solid rgba(255,255,255,0.9)",
              borderRadius: 16, padding: 32, textAlign: "center",
              boxShadow: "0 8px 32px rgba(99,102,241,0.08)",
            }}>
              <p style={{ fontSize: 13, color: "#94a3b8" }}>Belum ada siswa terdaftar.</p>
            </div>
          ) : siswaList.map((siswa) => {
            const kelasAktif = siswa.kelas[0]?.kelas?.nama ?? null;
            return (
              <div key={siswa.id} style={{
                background: "rgba(255,255,255,0.65)", backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)", border: "0.5px solid rgba(255,255,255,0.9)",
                borderRadius: 16, padding: "14px 16px",
                boxShadow: "0 4px 16px rgba(99,102,241,0.06)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{siswa.nama}</p>
                    <p style={{ fontSize: 11, fontFamily: "monospace", color: "#6366f1", fontWeight: 600, marginTop: 2 }}>{siswa.nis}</p>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: 24, height: 24, borderRadius: 6, fontSize: 11, fontWeight: 700,
                      background: siswa.jenisKelamin === "L" ? "rgba(14,165,233,0.1)" : "rgba(236,72,153,0.1)",
                      color: siswa.jenisKelamin === "L" ? "#0ea5e9" : "#ec4899",
                    }}>
                      {siswa.jenisKelamin}
                    </span>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      padding: "3px 8px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                      background: siswa.isActive ? "rgba(16,185,129,0.1)" : "rgba(148,163,184,0.15)",
                      color: siswa.isActive ? "#059669" : "#94a3b8",
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: siswa.isActive ? "#10b981" : "#94a3b8" }} />
                      {siswa.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {kelasAktif ? (
                    <span style={{
                      padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                      background: "rgba(99,102,241,0.08)", color: "#6366f1",
                    }}>
                      {kelasAktif}
                    </span>
                  ) : (
                    <span style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>Belum di kelas</span>
                  )}
                  <form action={async () => {
                    "use server";
                    await toggleSiswaAction(siswa.id, !siswa.isActive);
                  }}>
                    <button
                      type="submit"
                      className="btn-toggle"
                      style={{
                        padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 500,
                        border: "0.5px solid",
                        borderColor: siswa.isActive ? "rgba(239,68,68,0.3)" : "rgba(99,102,241,0.3)",
                        background: siswa.isActive ? "rgba(239,68,68,0.06)" : "rgba(99,102,241,0.06)",
                        color: siswa.isActive ? "#ef4444" : "#6366f1",
                        cursor: "pointer", transition: "all 0.2s",
                      }}
                    >
                      {siswa.isActive ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { toggleTahunAjaranAction, toggleSemesterAction } from "./actions";

async function getData(sekolahId: string) {
  return prisma.tahunAjaran.findMany({
    where: { sekolahId },
    orderBy: { nama: "desc" },
    include: {
      semester: { orderBy: { tanggalMulai: "asc" } },
      _count: { select: { kelas: true } },
    },
  });
}

export default async function TahunAjaranPage() {
  const user = await getCurrentUser();
  if (!user || !user.sekolahId) redirect("/login");

  const tahunAjaranList = await getData(user.sekolahId);

  return (
    <>
      <style>{`
        .row-hover:hover { background: rgba(99,102,241,0.04) !important; }
        .btn-action:hover { opacity: 0.8; }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
              Tahun Ajaran
            </h1>
            <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
              Kelola tahun ajaran dan semester sekolah Anda.
            </p>
          </div>
          <Link
            href="/admin/tahun-ajaran/tambah"
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
            Tambah Tahun Ajaran
          </Link>
        </div>

        {tahunAjaranList.length === 0 ? (
          <div style={{
            background: "rgba(255,255,255,0.65)", backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)", border: "0.5px solid rgba(255,255,255,0.9)",
            borderRadius: 20, padding: 48, textAlign: "center",
            boxShadow: "0 8px 32px rgba(99,102,241,0.08)",
          }}>
            <p style={{ fontSize: 13, color: "#94a3b8" }}>
              Belum ada tahun ajaran. Tambah tahun ajaran terlebih dahulu sebelum membuat kelas.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {tahunAjaranList.map((ta) => (
              <div key={ta.id} style={{
                background: "rgba(255,255,255,0.65)", backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)", border: "0.5px solid rgba(255,255,255,0.9)",
                borderRadius: 20, boxShadow: "0 8px 32px rgba(99,102,241,0.08)",
                overflow: "hidden",
              }}>
                {/* Header tahun ajaran */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "16px 24px", borderBottom: "0.5px solid rgba(0,0,0,0.06)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{ta.nama}</p>
                      <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                        {ta._count.kelas} kelas · {ta.semester.length} semester
                      </p>
                    </div>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                      background: ta.isActive ? "rgba(16,185,129,0.1)" : "rgba(148,163,184,0.15)",
                      color: ta.isActive ? "#059669" : "#94a3b8",
                    }}>
                      <span style={{
                        width: 5, height: 5, borderRadius: "50%",
                        background: ta.isActive ? "#10b981" : "#94a3b8",
                      }} />
                      {ta.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Link
                      href={`/admin/tahun-ajaran/${ta.id}/tambah-semester`}
                      className="btn-action"
                      style={{
                        padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500,
                        border: "0.5px solid rgba(99,102,241,0.3)",
                        background: "rgba(99,102,241,0.06)", color: "#6366f1",
                        textDecoration: "none", transition: "all 0.2s",
                      }}
                    >
                      + Semester
                    </Link>
                    <form action={async () => {
                      "use server";
                      await toggleTahunAjaranAction(ta.id, !ta.isActive);
                    }}>
                      <button
                        type="submit"
                        className="btn-action"
                        style={{
                          padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500,
                          border: "0.5px solid",
                          borderColor: ta.isActive ? "rgba(239,68,68,0.3)" : "rgba(99,102,241,0.3)",
                          background: ta.isActive ? "rgba(239,68,68,0.06)" : "rgba(99,102,241,0.06)",
                          color: ta.isActive ? "#ef4444" : "#6366f1",
                          cursor: "pointer", transition: "all 0.2s",
                        }}
                      >
                        {ta.isActive ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Daftar semester */}
                {ta.semester.length === 0 ? (
                  <div style={{ padding: "16px 24px" }}>
                    <p style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>
                      Belum ada semester. Klik "+ Semester" untuk menambahkan.
                    </p>
                  </div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "0.5px solid rgba(0,0,0,0.04)" }}>
                        {["Semester", "Mulai", "Selesai", "Status", "Aksi"].map((h) => (
                          <th key={h} style={{
                            padding: "10px 24px", textAlign: "left",
                            fontSize: 10, fontWeight: 700, color: "#94a3b8",
                            letterSpacing: "0.1em", textTransform: "uppercase",
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ta.semester.map((sem) => (
                        <tr key={sem.id} className="row-hover" style={{ borderBottom: "0.5px solid rgba(0,0,0,0.04)", transition: "background 0.15s" }}>
                          <td style={{ padding: "12px 24px" }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{sem.nama}</p>
                          </td>
                          <td style={{ padding: "12px 24px" }}>
                            <p style={{ fontSize: 13, color: "#475569" }}>
                              {new Date(sem.tanggalMulai).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                          </td>
                          <td style={{ padding: "12px 24px" }}>
                            <p style={{ fontSize: 13, color: "#475569" }}>
                              {new Date(sem.tanggalSelesai).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                          </td>
                          <td style={{ padding: "12px 24px" }}>
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: 5,
                              padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                              background: sem.isActive ? "rgba(16,185,129,0.1)" : "rgba(148,163,184,0.15)",
                              color: sem.isActive ? "#059669" : "#94a3b8",
                            }}>
                              <span style={{ width: 5, height: 5, borderRadius: "50%", background: sem.isActive ? "#10b981" : "#94a3b8" }} />
                              {sem.isActive ? "Aktif" : "Nonaktif"}
                            </span>
                          </td>
                          <td style={{ padding: "12px 24px" }}>
                            <form action={async () => {
                              "use server";
                              await toggleSemesterAction(sem.id, !sem.isActive);
                            }}>
                              <button
                                type="submit"
                                className="btn-action"
                                style={{
                                  padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 500,
                                  border: "0.5px solid",
                                  borderColor: sem.isActive ? "rgba(239,68,68,0.3)" : "rgba(99,102,241,0.3)",
                                  background: sem.isActive ? "rgba(239,68,68,0.06)" : "rgba(99,102,241,0.06)",
                                  color: sem.isActive ? "#ef4444" : "#6366f1",
                                  cursor: "pointer", transition: "all 0.2s",
                                }}
                              >
                                {sem.isActive ? "Nonaktifkan" : "Aktifkan"}
                              </button>
                            </form>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

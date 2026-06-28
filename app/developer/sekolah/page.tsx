import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getAllSekolah() {
  return prisma.sekolah.findMany({
    include: {
      langganan: true,
      _count: {
        select: { users: true, kelas: true, siswa: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status) {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center",
        background: "rgba(148,163,184,0.15)", color: "#94a3b8",
        borderRadius: 99, padding: "2px 10px", fontSize: 11, fontWeight: 600,
        border: "0.5px solid rgba(148,163,184,0.3)",
      }}>
        Belum ada langganan
      </span>
    );
  }

  const map: Record<string, { bg: string; color: string; border: string }> = {
    AKTIF:    { bg: "rgba(16,185,129,0.12)",  color: "#059669", border: "rgba(16,185,129,0.3)" },
    EXPIRED:  { bg: "rgba(239,68,68,0.12)",   color: "#dc2626", border: "rgba(239,68,68,0.3)" },
    NONAKTIF: { bg: "rgba(148,163,184,0.15)", color: "#94a3b8", border: "rgba(148,163,184,0.3)" },
  };

  const s = map[status] ?? map.NONAKTIF;

  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      background: s.bg, color: s.color,
      borderRadius: 99, padding: "2px 10px", fontSize: 11, fontWeight: 600,
      border: `0.5px solid ${s.border}`,
    }}>
      {status}
    </span>
  );
}

function PaketBadge({ paket }: { paket: string | null }) {
  if (!paket) return null;

  const map: Record<string, { bg: string; color: string; border: string }> = {
    STARTER:    { bg: "rgba(148,163,184,0.15)", color: "#64748b",  border: "rgba(148,163,184,0.3)" },
    BASIC:      { bg: "rgba(59,130,246,0.12)",  color: "#2563eb",  border: "rgba(59,130,246,0.3)" },
    PRO:        { bg: "rgba(99,102,241,0.12)",  color: "#4f46e5",  border: "rgba(99,102,241,0.3)" },
    ENTERPRISE: { bg: "rgba(168,85,247,0.12)",  color: "#7c3aed",  border: "rgba(168,85,247,0.3)" },
  };

  const s = map[paket] ?? map.STARTER;

  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      background: s.bg, color: s.color,
      borderRadius: 99, padding: "2px 10px", fontSize: 11, fontWeight: 600,
      border: `0.5px solid ${s.border}`,
    }}>
      {paket.charAt(0) + paket.slice(1).toLowerCase()}
    </span>
  );
}

export default async function SekolahPage() {
  const sekolahList = await getAllSekolah();

  return (
    <>
      <style>{`
        .sekolah-row:hover { background: rgba(99,102,241,0.04); }
        .detail-btn:hover { background: rgba(99,102,241,0.15) !important; }
        @media (max-width: 768px) {
          .sekolah-header { flex-direction: column !important; gap: 12px !important; align-items: stretch !important; }
          .sekolah-header a { justify-content: center; }
          .sekolah-table-wrap { display: none !important; }
          .sekolah-cards { display: flex !important; }
        }
        @media (min-width: 769px) {
          .sekolah-cards { display: none !important; }
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Page header */}
        <div className="sekolah-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
              Manajemen Sekolah
            </h1>
            <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
              {sekolahList.length} sekolah terdaftar.
            </p>
          </div>
          <Link
            href="/developer/sekolah/tambah"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              color: "#fff", borderRadius: 12, padding: "9px 18px",
              fontSize: 13, fontWeight: 700, textDecoration: "none",
              boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
            }}
          >
            + Tambah Sekolah
          </Link>
        </div>

        {/* Table card */}
        <div className="sekolah-table-wrap" style={{
          background: "rgba(255,255,255,0.65)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "0.5px solid rgba(255,255,255,0.9)",
          borderRadius: 20,
          boxShadow: "0 8px 32px rgba(99,102,241,0.08)",
          overflow: "hidden",
        }}>
          {sekolahList.length === 0 ? (
            <div style={{ padding: "80px 24px", textAlign: "center" }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16, margin: "0 auto 16px",
                background: "rgba(99,102,241,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 26,
              }}>
                🏫
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#64748b" }}>
                Belum ada sekolah terdaftar.
              </p>
              <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                Klik &quot;Tambah Sekolah&quot; untuk mulai.
              </p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "0.5px solid rgba(99,102,241,0.1)" }}>
                  {["Nama Sekolah", "Status", "Paket", "Kelas", "Siswa", "User", "Terdaftar", ""].map((col, i) => (
                    <th key={i} style={{
                      padding: "12px 20px",
                      textAlign: i === 7 ? "right" : "left",
                      fontSize: 10, fontWeight: 700,
                      color: "#94a3b8", letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      background: "rgba(248,250,252,0.6)",
                    }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sekolahList.map((sekolah, idx) => (
                  <tr
                    key={sekolah.id}
                    className="sekolah-row"
                    style={{
                      borderBottom: idx < sekolahList.length - 1
                        ? "0.5px solid rgba(99,102,241,0.06)"
                        : "none",
                      transition: "background 0.15s",
                    }}
                  >
                    <td style={{ padding: "14px 20px" }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                        {sekolah.nama}
                      </p>
                      {sekolah.alamat && (
                        <p style={{
                          fontSize: 11, color: "#94a3b8", marginTop: 2,
                          maxWidth: 200, overflow: "hidden",
                          textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {sekolah.alamat}
                        </p>
                      )}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <StatusBadge status={sekolah.langganan?.status ?? null} />
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <PaketBadge paket={sekolah.langganan?.paket ?? null} />
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 600, color: "#334155" }}>
                      {sekolah._count.kelas}
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 600, color: "#334155" }}>
                      {sekolah._count.siswa}
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: 13, fontWeight: 600, color: "#334155" }}>
                      {sekolah._count.users}
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: 12, color: "#94a3b8" }}>
                      {new Date(sekolah.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </td>
                    <td style={{ padding: "14px 20px", textAlign: "right" }}>
                      <Link
                        href={`/developer/sekolah/${sekolah.id}`}
                        className="detail-btn"
                        style={{
                          fontSize: 12, fontWeight: 600, color: "#6366f1",
                          textDecoration: "none",
                          padding: "5px 12px",
                          background: "rgba(99,102,241,0.08)",
                          borderRadius: 8,
                          border: "0.5px solid rgba(99,102,241,0.2)",
                          transition: "background 0.15s",
                        }}
                      >
                        Detail →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Mobile card view */}
        <div className="sekolah-cards" style={{ flexDirection: "column", gap: 10, display: "none" }}>
          {sekolahList.length === 0 ? (
            <div style={{
              background: "rgba(255,255,255,0.65)", backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)", border: "0.5px solid rgba(255,255,255,0.9)",
              borderRadius: 16, padding: 32, textAlign: "center",
              boxShadow: "0 8px 32px rgba(99,102,241,0.08)",
            }}>
              <p style={{ fontSize: 13, color: "#94a3b8" }}>Belum ada sekolah terdaftar.</p>
            </div>
          ) : sekolahList.map((sekolah) => (
            <div key={sekolah.id} style={{
              background: "rgba(255,255,255,0.65)", backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)", border: "0.5px solid rgba(255,255,255,0.9)",
              borderRadius: 16, padding: "14px 16px",
              boxShadow: "0 4px 16px rgba(99,102,241,0.06)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{sekolah.nama}</p>
                  {sekolah.alamat && (
                    <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{sekolah.alamat}</p>
                  )}
                </div>
                <Link
                  href={`/developer/sekolah/${sekolah.id}`}
                  style={{
                    fontSize: 11, fontWeight: 600, color: "#6366f1",
                    textDecoration: "none", padding: "5px 12px",
                    background: "rgba(99,102,241,0.08)", borderRadius: 8,
                    border: "0.5px solid rgba(99,102,241,0.2)", flexShrink: 0,
                  }}
                >
                  Detail →
                </Link>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                <StatusBadge status={sekolah.langganan?.status ?? null} />
                <PaketBadge paket={sekolah.langganan?.paket ?? null} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#64748b" }}>
                <span><strong style={{ color: "#334155" }}>{sekolah._count.kelas}</strong> kelas</span>
                <span><strong style={{ color: "#334155" }}>{sekolah._count.siswa}</strong> siswa</span>
                <span><strong style={{ color: "#334155" }}>{sekolah._count.users}</strong> user</span>
                <span>
                  {new Date(sekolah.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

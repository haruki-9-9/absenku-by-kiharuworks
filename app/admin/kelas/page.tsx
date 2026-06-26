import { getCurrentUser } from "@/lib/auth/get-current-user";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { toggleKelasAction } from "./actions";

async function getKelasData(sekolahId: string) {
  const [kelasList, langganan] = await Promise.all([
    prisma.kelas.findMany({
      where: { sekolahId },
      orderBy: [{ isActive: "desc" }, { nama: "asc" }],
      include: {
        _count: { select: { siswa: true } },
        sekretaris: { include: { user: { select: { name: true } } } },
      },
    }),
    prisma.langganan.findUnique({ where: { sekolahId } }),
  ]);

  return { kelasList, langganan };
}

export default async function KelasPage() {
  const user = await getCurrentUser();
  if (!user || !user.sekolahId) redirect("/login");

  const { kelasList, langganan } = await getKelasData(user.sekolahId);
  const kelasAktif = kelasList.filter((k) => k.isActive).length;
  const maxKelas = langganan?.maxKelas ?? 0;

  return (
    <>
      <style>{`
        .kelas-row:hover { background: rgba(99,102,241,0.04) !important; }
        .btn-tambah:hover { opacity: 0.9; transform: translateY(-1px); }
        .btn-toggle:hover { opacity: 0.8; }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
              Kelola Kelas
            </h1>
            <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
              {kelasAktif} / {maxKelas} kelas aktif digunakan
            </p>
          </div>
          <Link
            href="/admin/kelas/tambah"
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
            Tambah Kelas
          </Link>
        </div>

        {/* Kuota bar */}
        <div style={{
          background: "rgba(255,255,255,0.65)", backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)", border: "0.5px solid rgba(255,255,255,0.9)",
          borderRadius: 20, padding: "16px 24px", boxShadow: "0 8px 32px rgba(99,102,241,0.08)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Kuota Kelas</p>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#6366f1" }}>
              {kelasAktif} / {maxKelas}
            </p>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: "rgba(99,102,241,0.1)", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 99,
              width: `${Math.min((kelasAktif / maxKelas) * 100, 100)}%`,
              background: kelasAktif >= maxKelas
                ? "linear-gradient(90deg, #ef4444, #f87171)"
                : "linear-gradient(90deg, #6366f1, #8b5cf6)",
              transition: "width 0.5s ease",
            }} />
          </div>
          {kelasAktif >= maxKelas && (
            <p style={{ fontSize: 11, color: "#ef4444", marginTop: 8 }}>
              Kuota kelas sudah penuh. Upgrade paket untuk menambah lebih banyak kelas.
            </p>
          )}
        </div>

        {/* Tabel kelas */}
        <div style={{
          background: "rgba(255,255,255,0.65)", backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)", border: "0.5px solid rgba(255,255,255,0.9)",
          borderRadius: 20, boxShadow: "0 8px 32px rgba(99,102,241,0.08)", overflow: "hidden",
        }}>
          {kelasList.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "#94a3b8" }}>Belum ada kelas. Tambah kelas pertama Anda.</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "0.5px solid rgba(0,0,0,0.06)" }}>
                  {["Nama Kelas", "Jumlah Siswa", "Petugas Absensi", "Status", "Aksi"].map((h) => (
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
                {kelasList.map((kelas) => (
                  <tr
                    key={kelas.id}
                    className="kelas-row"
                    style={{ borderBottom: "0.5px solid rgba(0,0,0,0.04)", transition: "background 0.15s" }}
                  >
                    <td style={{ padding: "14px 20px" }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{kelas.nama}</p>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <p style={{ fontSize: 13, color: "#475569" }}>{kelas._count.siswa} siswa</p>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <p style={{ fontSize: 13, color: "#475569" }}>
                        {kelas.sekretaris?.user.name ?? (
                          <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Belum ditugaskan</span>
                        )}
                      </p>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600,
                        background: kelas.isActive ? "rgba(16,185,129,0.1)" : "rgba(148,163,184,0.15)",
                        color: kelas.isActive ? "#059669" : "#94a3b8",
                      }}>
                        <span style={{
                          width: 5, height: 5, borderRadius: "50%",
                          background: kelas.isActive ? "#10b981" : "#94a3b8",
                        }} />
                        {kelas.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <form action={async () => {
                        "use server";
                        await toggleKelasAction(kelas.id, !kelas.isActive);
                      }}>
                        <button
                          type="submit"
                          className="btn-toggle"
                          style={{
                            padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500,
                            border: "0.5px solid",
                            borderColor: kelas.isActive ? "rgba(239,68,68,0.3)" : "rgba(99,102,241,0.3)",
                            background: kelas.isActive ? "rgba(239,68,68,0.06)" : "rgba(99,102,241,0.06)",
                            color: kelas.isActive ? "#ef4444" : "#6366f1",
                            cursor: "pointer", transition: "all 0.2s",
                          }}
                        >
                          {kelas.isActive ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

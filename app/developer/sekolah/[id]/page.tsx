import { prisma } from "@/lib/prisma";
import LanggananForm from "./LanggananForm";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function getSekolahDetail(id: string) {
  return prisma.sekolah.findUnique({
    where: { id },
    include: {
      langganan: true,
      konfigurasi: true,
      users: {
        where: { role: { not: "DEVELOPER" } },
        select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      },
      _count: {
        select: { kelas: true, siswa: true },
      },
    },
  });
}

async function hapusSekolahAction(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  await prisma.sekolah.delete({ where: { id } });
  revalidatePath("/developer/sekolah");
  redirect("/developer/sekolah");
}

const PAKET_LABEL: Record<string, string> = {
  STARTER: "Starter",
  BASIC: "Basic",
  PRO: "Pro",
  ENTERPRISE: "Enterprise",
};

const ROLE_LABEL: Record<string, string> = {
  ADMIN_SEKOLAH: "Admin Sekolah",
  SEKRETARIS: "Petugas Absensi",
  WALI_KELAS: "Wali Kelas",
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        {label}
      </p>
      <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{value}</p>
    </div>
  );
}

function Badge({ label, bg, color, border }: { label: string; bg: string; color: string; border: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      background: bg, color, borderRadius: 99,
      padding: "2px 10px", fontSize: 11, fontWeight: 600,
      border: `0.5px solid ${border}`,
    }}>
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    AKTIF:    { bg: "rgba(16,185,129,0.12)",  color: "#059669", border: "rgba(16,185,129,0.3)" },
    EXPIRED:  { bg: "rgba(239,68,68,0.12)",   color: "#dc2626", border: "rgba(239,68,68,0.3)" },
    NONAKTIF: { bg: "rgba(148,163,184,0.15)", color: "#94a3b8", border: "rgba(148,163,184,0.3)" },
  };
  const s = map[status] ?? map.NONAKTIF;
  return <Badge label={status} {...s} />;
}

function PaketBadge({ paket }: { paket: string }) {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    STARTER:    { bg: "rgba(148,163,184,0.15)", color: "#64748b", border: "rgba(148,163,184,0.3)" },
    BASIC:      { bg: "rgba(59,130,246,0.12)",  color: "#2563eb", border: "rgba(59,130,246,0.3)" },
    PRO:        { bg: "rgba(99,102,241,0.12)",  color: "#4f46e5", border: "rgba(99,102,241,0.3)" },
    ENTERPRISE: { bg: "rgba(168,85,247,0.12)",  color: "#7c3aed", border: "rgba(168,85,247,0.3)" },
  };
  const s = map[paket] ?? map.STARTER;
  return <Badge label={PAKET_LABEL[paket] ?? paket} {...s} />;
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    ADMIN_SEKOLAH: { bg: "rgba(99,102,241,0.1)",  color: "#4f46e5", border: "rgba(99,102,241,0.25)" },
    SEKRETARIS:    { bg: "rgba(59,130,246,0.1)",   color: "#2563eb", border: "rgba(59,130,246,0.25)" },
    WALI_KELAS:    { bg: "rgba(16,185,129,0.1)",   color: "#059669", border: "rgba(16,185,129,0.25)" },
  };
  const s = map[role] ?? { bg: "rgba(148,163,184,0.15)", color: "#94a3b8", border: "rgba(148,163,184,0.3)" };
  return <Badge label={ROLE_LABEL[role] ?? role} {...s} />;
}

const cardStyle = {
  background: "rgba(255,255,255,0.65)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "0.5px solid rgba(255,255,255,0.9)",
  borderRadius: 20,
  boxShadow: "0 8px 32px rgba(99,102,241,0.08)",
  overflow: "hidden" as const,
};

const cardHeaderStyle = {
  padding: "16px 24px",
  borderBottom: "0.5px solid rgba(99,102,241,0.08)",
};

export default async function DetailSekolahPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sekolah = await getSekolahDetail(id);
  if (!sekolah) notFound();

  const l = sekolah.langganan;
  const k = sekolah.konfigurasi;

  return (
    <>
      <style>{`
        .user-row:hover { background: rgba(99,102,241,0.04); }
        .hapus-btn:hover { background: rgba(239,68,68,0.15) !important; }
        @media (max-width: 768px) {
          .detail-header { flex-direction: column !important; gap: 14px !important; align-items: stretch !important; }
          .detail-header form button { width: 100%; }
          .detail-stat-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .detail-info-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .detail-tabel-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .detail-tabel-scroll table { min-width: 560px; }
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Header */}
        <div className="detail-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link
              href="/developer/sekolah"
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 36, height: 36, borderRadius: 10,
                background: "rgba(255,255,255,0.65)", border: "0.5px solid rgba(99,102,241,0.15)",
                color: "#64748b", textDecoration: "none", fontSize: 16,
                backdropFilter: "blur(8px)",
              }}
            >
              ←
            </Link>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
                {sekolah.nama}
              </h1>
              {sekolah.alamat && (
                <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{sekolah.alamat}</p>
              )}
            </div>
          </div>

          {/* Hapus sekolah */}
          <form action={hapusSekolahAction}>
            <input type="hidden" name="id" value={sekolah.id} />
            <button
              type="submit"
              className="hapus-btn"
              onClick={(e) => {
                if (!confirm(`Hapus "${sekolah.nama}"? Semua data terkait akan ikut terhapus.`)) {
                  e.preventDefault();
                }
              }}
              style={{
                padding: "9px 18px", borderRadius: 12, fontSize: 13, fontWeight: 600,
                background: "rgba(239,68,68,0.08)", color: "#dc2626",
                border: "0.5px solid rgba(239,68,68,0.2)", cursor: "pointer",
                transition: "background 0.15s",
              }}
            >
              Hapus Sekolah
            </button>
          </form>
        </div>

        {/* Stat mini */}
        <div className="detail-stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { label: "Total Kelas", value: sekolah._count.kelas, color: "#6366f1" },
            { label: "Total Siswa", value: sekolah._count.siswa, color: "#0ea5e9" },
            { label: "Total User", value: sekolah.users.length, color: "#8b5cf6" },
          ].map((s) => (
            <div key={s.label} style={{ ...cardStyle, padding: "20px 24px" }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {s.label}
              </p>
              <p style={{ marginTop: 8, fontSize: 36, fontWeight: 800, color: s.color, letterSpacing: "-1px", lineHeight: 1 }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Info Langganan */}
        <div style={cardStyle}>
          <div style={{ ...cardHeaderStyle, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Langganan</p>
            <LanggananForm sekolahId={sekolah.id} langganan={l ?? null} />
          </div>
          <div style={{ padding: "20px 24px" }}>
            {l ? (
              <div className="detail-info-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
                <InfoRow label="Paket" value={<PaketBadge paket={l.paket} />} />
                <InfoRow label="Status" value={<StatusBadge status={l.status} />} />
                <InfoRow label="Mulai" value={new Date(l.tanggalMulai).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} />
                <InfoRow label="Berakhir" value={new Date(l.tanggalBerakhir).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} />
                <InfoRow label="Maks. Kelas" value={l.maxKelas === 9999 ? "Unlimited" : `${l.maxKelas} kelas`} />
                {l.catatanAdmin && <InfoRow label="Catatan" value={l.catatanAdmin} />}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: "#94a3b8" }}>Belum ada data langganan.</p>
            )}
          </div>
        </div>

        {/* Konfigurasi */}
        {k && (
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Konfigurasi Sekolah</p>
            </div>
            <div className="detail-info-grid" style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
              <InfoRow label="Jam Lock Absensi" value={k.jamLock} />
              <InfoRow label="Batas Alpa" value={`${k.batasAlpa} hari`} />
              <InfoRow label="Zona Waktu" value={k.zonaWaktu} />
            </div>
          </div>
        )}

        {/* Daftar User */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Akun User</p>
            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{sekolah.users.length} akun terdaftar</p>
          </div>

          {sekolah.users.length === 0 ? (
            <div style={{ padding: "40px 24px", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "#94a3b8" }}>Belum ada akun user.</p>
            </div>
          ) : (
            <div className="detail-tabel-scroll">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "0.5px solid rgba(99,102,241,0.08)" }}>
                  {["Nama", "Email", "Role", "Status", "Dibuat"].map((h, i) => (
                    <th key={h} style={{
                      padding: "10px 20px", textAlign: "left",
                      fontSize: 10, fontWeight: 700, color: "#94a3b8",
                      letterSpacing: "0.1em", textTransform: "uppercase",
                      background: "rgba(248,250,252,0.6)",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sekolah.users.map((user, idx) => (
                  <tr
                    key={user.id}
                    className="user-row"
                    style={{
                      borderBottom: idx < sekolah.users.length - 1 ? "0.5px solid rgba(99,102,241,0.06)" : "none",
                      transition: "background 0.15s",
                    }}
                  >
                    <td style={{ padding: "12px 20px", fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                      {user.name}
                    </td>
                    <td style={{ padding: "12px 20px", fontSize: 13, color: "#64748b" }}>
                      {user.email}
                    </td>
                    <td style={{ padding: "12px 20px" }}>
                      <RoleBadge role={user.role} />
                    </td>
                    <td style={{ padding: "12px 20px" }}>
                      <Badge
                        label={user.isActive ? "Aktif" : "Nonaktif"}
                        bg={user.isActive ? "rgba(16,185,129,0.1)" : "rgba(148,163,184,0.15)"}
                        color={user.isActive ? "#059669" : "#94a3b8"}
                        border={user.isActive ? "rgba(16,185,129,0.25)" : "rgba(148,163,184,0.3)"}
                      />
                    </td>
                    <td style={{ padding: "12px 20px", fontSize: 12, color: "#94a3b8" }}>
                      {new Date(user.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>

      </div>
    </>
  );
}

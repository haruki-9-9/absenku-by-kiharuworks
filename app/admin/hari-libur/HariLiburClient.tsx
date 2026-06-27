"use client";

import { useActionState, useTransition, useRef } from "react";
import { tambahHariLiburAction, hapusHariLiburAction } from "./actions";

const NAMA_BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

type HariLibur = {
  id: string;
  tanggal: Date;
  keterangan: string;
};

type Props = {
  hariLiburList: HariLibur[];
};

function formatTanggal(date: Date) {
  const d = new Date(date);
  const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  return `${hari[d.getDay()]}, ${d.getDate()} ${NAMA_BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

function groupByBulan(list: HariLibur[]) {
  const map = new Map<string, HariLibur[]>();
  for (const item of list) {
    const d = new Date(item.tanggal);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, items]) => {
      const [year, month] = key.split("-").map(Number);
      return { label: `${NAMA_BULAN[month]} ${year}`, items };
    });
}

export default function HariLiburClient({ hariLiburList }: Props) {
  const [state, formAction, pending] = useActionState(tambahHariLiburAction, {
    success: false,
    message: "",
  });
  const [isDeleting, startDelete] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const grouped = groupByBulan(hariLiburList);

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    border: "0.5px solid rgba(99,102,241,0.2)",
    background: "rgba(255,255,255,0.6)",
    fontSize: 13,
    color: "#0f172a",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    fontSize: 11,
    fontWeight: 700 as const,
    color: "#64748b",
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    marginBottom: 6,
    display: "block",
  };

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
      <style>{`
        .hl-input:focus { border-color: rgba(99,102,241,0.5) !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        .btn-tambah:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .btn-hapus:hover { background: rgba(239,68,68,0.12) !important; color: #dc2626 !important; }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Header */}
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
            Hari Libur
          </h1>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
            Kelola hari libur sekolah. Tanggal libur akan ditandai abu-abu di rekap absensi.
          </p>
        </div>

        {/* Layout 2 kolom */}
        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 24, alignItems: "start" }}>

          {/* Kiri — Form tambah */}
          <div style={{ ...cardStyle, padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Tambah Hari Libur</p>

            <form
              ref={formRef}
              action={(formData) => {
                formAction(formData);
                // reset form setelah submit sukses ditangani di useEffect — tapi karena server action,
                // kita reset manual via ref setelah action selesai
              }}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <div>
                <label htmlFor="tanggal" style={labelStyle}>Tanggal</label>
                <input
                  id="tanggal"
                  name="tanggal"
                  type="date"
                  required
                  className="hl-input"
                  style={inputStyle}
                />
              </div>

              <div>
                <label htmlFor="keterangan" style={labelStyle}>Keterangan</label>
                <input
                  id="keterangan"
                  name="keterangan"
                  type="text"
                  placeholder="cth: Hari Raya Idul Fitri"
                  required
                  className="hl-input"
                  style={inputStyle}
                />
              </div>

              {state.message && (
                <div style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 500,
                  background: state.success ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                  color: state.success ? "#16a34a" : "#dc2626",
                  border: `0.5px solid ${state.success ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
                }}>
                  {state.message}
                </div>
              )}

              <button
                type="submit"
                disabled={pending}
                className="btn-tambah"
                style={{
                  padding: "11px 0",
                  borderRadius: 12,
                  border: "none",
                  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: pending ? "not-allowed" : "pointer",
                  opacity: pending ? 0.7 : 1,
                  transition: "all 0.2s",
                  boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
                }}
              >
                {pending ? "Menyimpan..." : "Tambah"}
              </button>
            </form>
          </div>

          {/* Kanan — List hari libur */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {hariLiburList.length === 0 ? (
              <div style={{ ...cardStyle, padding: 48, textAlign: "center" }}>
                <p style={{ fontSize: 13, color: "#94a3b8" }}>
                  Belum ada hari libur yang ditambahkan.
                </p>
              </div>
            ) : (
              grouped.map(({ label, items }) => (
                <div key={label} style={{ ...cardStyle, padding: 20 }}>
                  <p style={{
                    fontSize: 11, fontWeight: 700, color: "#6366f1",
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    marginBottom: 12,
                  }}>
                    {label}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {items
                      .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime())
                      .map((item) => (
                        <div
                          key={item.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 14px",
                            borderRadius: 12,
                            background: "rgba(99,102,241,0.04)",
                            border: "0.5px solid rgba(99,102,241,0.08)",
                            gap: 12,
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                              {item.keterangan}
                            </p>
                            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                              {formatTanggal(item.tanggal)}
                            </p>
                          </div>
                          <button
                            className="btn-hapus"
                            disabled={isDeleting}
                            onClick={() => {
                              if (confirm(`Hapus "${item.keterangan}"?`)) {
                                startDelete(() => hapusHariLiburAction(item.id));
                              }
                            }}
                            style={{
                              padding: "6px 12px",
                              borderRadius: 8,
                              border: "0.5px solid rgba(239,68,68,0.2)",
                              background: "transparent",
                              color: "#ef4444",
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: isDeleting ? "not-allowed" : "pointer",
                              transition: "all 0.2s",
                              flexShrink: 0,
                            }}
                          >
                            Hapus
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

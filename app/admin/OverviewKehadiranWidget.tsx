"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type KelasData = {
  id: string;
  nama: string;
  totalSiswa: number;
  hadir: number;
  sakit: number;
  izin: number;
  alpa: number;
  belumDiisi: number;
  sudahDiisi: number;
  persen: number;
};

type ResponseData = {
  tanggal: string;
  kelas: KelasData[];
};

const NAMA_BULAN = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];

function formatTanggal(iso: string) {
  const d = new Date(iso);
  const hari = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
  return `${hari[d.getDay()]}, ${d.getDate()} ${NAMA_BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

export default function OverviewKehadiranWidget() {
  const [data, setData] = useState<ResponseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const cardStyle = {
    background: "rgba(255,255,255,0.65)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "0.5px solid rgba(255,255,255,0.9)",
    borderRadius: 20,
    boxShadow: "0 8px 32px rgba(99,102,241,0.08)",
  };

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/kehadiran/overview");
      if (res.ok) {
        setData(await res.json());
        setLastRefresh(new Date());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Hitung total keseluruhan
  const totalSemua = data?.kelas.reduce((a, k) => a + k.totalSiswa, 0) ?? 0;
  const hadirSemua = data?.kelas.reduce((a, k) => a + k.hadir, 0) ?? 0;
  const alpaSemua = data?.kelas.reduce((a, k) => a + k.alpa, 0) ?? 0;
  const belumSemua = data?.kelas.reduce((a, k) => a + k.belumDiisi, 0) ?? 0;
  const persenSemua = totalSemua > 0 ? Math.round((hadirSemua / totalSemua) * 100) : 0;

  // Kelas dengan alpa terbanyak
  const kelasAlpaTerbanyak = data?.kelas
    .filter((k) => k.alpa > 0)
    .sort((a, b) => b.alpa - a.alpa)[0] ?? null;

  return (
    <>
      <style>{`
        .refresh-btn:hover { background: rgba(99,102,241,0.12) !important; }
        .kelas-row:hover { background: rgba(99,102,241,0.03) !important; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ ...cardStyle, padding: "20px 24px" }}>
        {/* Header widget */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Kehadiran Hari Ini
            </p>
            {data && (
              <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                {formatTanggal(data.tanggal)}
                {lastRefresh && (
                  <span style={{ marginLeft: 8 }}>
                    · Diperbarui {lastRefresh.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                )}
              </p>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              className="refresh-btn"
              onClick={fetchData}
              disabled={loading}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "6px 12px", borderRadius: 8,
                border: "0.5px solid rgba(99,102,241,0.2)",
                background: "rgba(255,255,255,0.65)",
                fontSize: 11, fontWeight: 600, color: "#6366f1",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1, transition: "all 0.2s",
              }}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" width={11} height={11}
                style={{ animation: loading ? "spin 1s linear infinite" : "none" }}>
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Refresh
            </button>
            <Link
              href="/admin/kehadiran"
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "6px 12px", borderRadius: 8,
                border: "0.5px solid rgba(99,102,241,0.2)",
                background: "rgba(99,102,241,0.08)",
                fontSize: 11, fontWeight: 600, color: "#6366f1",
                textDecoration: "none",
              }}
            >
              Lihat Detail →
            </Link>
          </div>
        </div>

        {loading && !data ? (
          <div style={{ padding: "32px 0", textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "#94a3b8" }}>Memuat data...</p>
          </div>
        ) : !data || data.kelas.length === 0 ? (
          <div style={{ padding: "32px 0", textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "#94a3b8" }}>Belum ada kelas aktif.</p>
          </div>
        ) : (
          <>
            {/* Ringkasan total */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
              {[
                { label: "% Kehadiran", value: `${persenSemua}%`, color: persenSemua >= 80 ? "#16a34a" : persenSemua >= 60 ? "#b45309" : "#dc2626", bg: "rgba(99,102,241,0.06)" },
                { label: "Hadir", value: hadirSemua, color: "#16a34a", bg: "rgba(34,197,94,0.06)" },
                { label: "Alpa", value: alpaSemua, color: "#dc2626", bg: "rgba(239,68,68,0.06)" },
                { label: "Belum Diisi", value: belumSemua, color: "#94a3b8", bg: "rgba(148,163,184,0.06)" },
              ].map((s) => (
                <div key={s.label} style={{
                  padding: "12px 16px", borderRadius: 12,
                  background: s.bg, border: "0.5px solid rgba(0,0,0,0.04)",
                }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    {s.label}
                  </p>
                  <p style={{ fontSize: 22, fontWeight: 800, color: s.color, marginTop: 4 }}>
                    {s.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Alert alpa terbanyak */}
            {kelasAlpaTerbanyak && kelasAlpaTerbanyak.alpa > 0 && (
              <div style={{
                padding: "10px 14px", borderRadius: 10, marginBottom: 16,
                background: "rgba(239,68,68,0.06)",
                border: "0.5px solid rgba(239,68,68,0.15)",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{ fontSize: 13 }}>⚠️</span>
                <p style={{ fontSize: 12, color: "#dc2626" }}>
                  Alpa terbanyak: <strong>{kelasAlpaTerbanyak.nama}</strong> ({kelasAlpaTerbanyak.alpa} siswa)
                </p>
              </div>
            )}

            {/* Tabel per kelas */}
            <div style={{ borderRadius: 12, overflow: "hidden", border: "0.5px solid rgba(0,0,0,0.06)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "rgba(99,102,241,0.04)", borderBottom: "0.5px solid rgba(0,0,0,0.06)" }}>
                    {["Kelas", "Siswa", "Hadir", "Sakit", "Izin", "Alpa", "Belum", "% Hadir"].map((h) => (
                      <th key={h} style={{
                        padding: "10px 14px", textAlign: h === "Kelas" ? "left" : "center",
                        fontSize: 10, fontWeight: 700, color: "#94a3b8",
                        letterSpacing: "0.08em", textTransform: "uppercase",
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.kelas.map((k, i) => {
                    const persenColor = k.persen >= 80 ? "#16a34a" : k.persen >= 60 ? "#b45309" : "#dc2626";
                    return (
                      <tr key={k.id} className="kelas-row" style={{
                        borderBottom: i < data.kelas.length - 1 ? "0.5px solid rgba(0,0,0,0.04)" : "none",
                        opacity: loading ? 0.6 : 1, transition: "all 0.2s",
                      }}>
                        <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                          {k.nama}
                        </td>
                        <td style={{ padding: "11px 14px", textAlign: "center", fontSize: 12, color: "#64748b" }}>
                          {k.totalSiswa}
                        </td>
                        <td style={{ padding: "11px 14px", textAlign: "center" }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#16a34a" }}>{k.hadir}</span>
                        </td>
                        <td style={{ padding: "11px 14px", textAlign: "center" }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: k.sakit > 0 ? "#b45309" : "#cbd5e1" }}>{k.sakit}</span>
                        </td>
                        <td style={{ padding: "11px 14px", textAlign: "center" }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: k.izin > 0 ? "#1d4ed8" : "#cbd5e1" }}>{k.izin}</span>
                        </td>
                        <td style={{ padding: "11px 14px", textAlign: "center" }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: k.alpa > 0 ? "#dc2626" : "#cbd5e1" }}>{k.alpa}</span>
                        </td>
                        <td style={{ padding: "11px 14px", textAlign: "center" }}>
                          <span style={{ fontSize: 12, color: k.belumDiisi > 0 ? "#f59e0b" : "#cbd5e1", fontWeight: k.belumDiisi > 0 ? 600 : 400 }}>
                            {k.belumDiisi}
                          </span>
                        </td>
                        <td style={{ padding: "11px 14px", textAlign: "center" }}>
                          <span style={{
                            display: "inline-block", padding: "2px 8px", borderRadius: 6,
                            fontSize: 11, fontWeight: 700, color: persenColor,
                            background: `${persenColor}18`,
                          }}>
                            {k.persen}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}

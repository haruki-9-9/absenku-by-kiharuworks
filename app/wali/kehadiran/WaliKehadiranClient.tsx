"use client";

import { useState, useEffect, useCallback } from "react";

type SiswaData = {
  siswaId: string;
  nomorAbsen: number;
  nama: string;
  nis: string;
  status: "H" | "S" | "I" | "A" | null;
  keterangan: string | null;
};

type Ringkasan = {
  total: number;
  hadir: number;
  sakit: number;
  izin: number;
  alpa: number;
  belumDiisi: number;
};

type ResponseData = {
  kelas: { id: string; nama: string };
  tanggal: string;
  siswa: SiswaData[];
  ringkasan: Ringkasan;
};

const STATUS_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  H: { bg: "rgba(34,197,94,0.12)", text: "#16a34a", border: "rgba(34,197,94,0.25)" },
  S: { bg: "rgba(245,158,11,0.12)", text: "#b45309", border: "rgba(245,158,11,0.25)" },
  I: { bg: "rgba(59,130,246,0.12)", text: "#1d4ed8", border: "rgba(59,130,246,0.25)" },
  A: { bg: "rgba(239,68,68,0.12)", text: "#dc2626", border: "rgba(239,68,68,0.25)" },
};

const STATUS_LABEL: Record<string, string> = { H: "Hadir", S: "Sakit", I: "Izin", A: "Alpa" };

const NAMA_BULAN = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];

function formatTanggal(iso: string) {
  const d = new Date(iso);
  const hari = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
  return `${hari[d.getDay()]}, ${d.getDate()} ${NAMA_BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

export default function WaliKehadiranClient({
  kelasId,
  kelasNama,
}: {
  kelasId: string;
  kelasNama: string;
}) {
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
    setLoading(true);
    try {
      const res = await fetch(`/api/kehadiran?kelasId=${kelasId}`);
      if (res.ok) {
        setData(await res.json());
        setLastRefresh(new Date());
      }
    } finally {
      setLoading(false);
    }
  }, [kelasId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-refresh tiap 30 detik
  useEffect(() => {
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const ringkasan = data?.ringkasan;

  return (
    <>
      <style>{`
        .refresh-btn:hover { background: rgba(99,102,241,0.12) !important; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
              Kehadiran Hari Ini
            </h1>
            <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
              Kelas <strong>{kelasNama}</strong>
              {lastRefresh && (
                <span style={{ color: "#94a3b8", marginLeft: 8 }}>
                  · Diperbarui {lastRefresh.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
              )}
            </p>
          </div>
          <button
            className="refresh-btn"
            onClick={fetchData}
            disabled={loading}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px", borderRadius: 10,
              border: "0.5px solid rgba(99,102,241,0.2)",
              background: "rgba(255,255,255,0.65)",
              fontSize: 12, fontWeight: 600, color: "#6366f1",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1, transition: "all 0.2s",
            }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width={13} height={13}
              style={{ animation: loading ? "spin 1s linear infinite" : "none" }}>
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Refresh
          </button>
        </div>

        {data && (
          <p style={{ fontSize: 12, color: "#94a3b8", marginTop: -8 }}>
            {formatTanggal(data.tanggal)}
          </p>
        )}

        {/* Stat cards */}
        {ringkasan && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
            {[
              { label: "Total Siswa", value: ringkasan.total, color: "#6366f1", bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.15)" },
              { label: "Hadir", value: ringkasan.hadir, color: "#16a34a", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.15)" },
              { label: "Sakit", value: ringkasan.sakit, color: "#b45309", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.15)" },
              { label: "Izin", value: ringkasan.izin, color: "#1d4ed8", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.15)" },
              { label: "Alpa", value: ringkasan.alpa, color: "#dc2626", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.15)" },
            ].map((stat) => (
              <div key={stat.label} style={{ ...cardStyle, padding: "16px 20px", background: stat.bg, border: `0.5px solid ${stat.border}` }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: stat.color, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {stat.label}
                </p>
                <p style={{ fontSize: 28, fontWeight: 800, color: stat.color, marginTop: 4 }}>
                  {stat.value}
                </p>
                {stat.label === "Total Siswa" && ringkasan.belumDiisi > 0 && (
                  <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
                    {ringkasan.belumDiisi} belum diisi
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tabel */}
        <div style={{ ...cardStyle, overflow: "hidden" }}>
          {loading && !data ? (
            <div style={{ padding: 48, textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "#94a3b8" }}>Memuat data...</p>
            </div>
          ) : data && data.siswa.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "#94a3b8" }}>Belum ada siswa di kelas ini.</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "0.5px solid rgba(0,0,0,0.06)" }}>
                  {["No", "Nama Siswa", "NIS", "Status", "Keterangan"].map((h) => (
                    <th key={h} style={{
                      padding: "12px 16px", textAlign: "left",
                      fontSize: 10, fontWeight: 700, color: "#94a3b8",
                      letterSpacing: "0.08em", textTransform: "uppercase",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data?.siswa.map((s, i) => {
                  const sc = s.status ? STATUS_COLOR[s.status] : null;
                  return (
                    <tr key={s.siswaId} style={{
                      borderBottom: i < (data.siswa.length - 1) ? "0.5px solid rgba(0,0,0,0.04)" : "none",
                      opacity: loading ? 0.6 : 1, transition: "opacity 0.2s",
                    }}>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#94a3b8", width: 40 }}>
                        {s.nomorAbsen}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                        {s.nama}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#64748b" }}>
                        {s.nis}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {s.status ? (
                          <span style={{
                            display: "inline-block", padding: "3px 10px", borderRadius: 6,
                            fontSize: 11, fontWeight: 700,
                            background: sc!.bg, color: sc!.text, border: `0.5px solid ${sc!.border}`,
                          }}>
                            {STATUS_LABEL[s.status]}
                          </span>
                        ) : (
                          <span style={{
                            display: "inline-block", padding: "3px 10px", borderRadius: 6,
                            fontSize: 11, fontWeight: 600,
                            background: "rgba(148,163,184,0.1)", color: "#94a3b8",
                            border: "0.5px solid rgba(148,163,184,0.2)",
                          }}>
                            Belum diisi
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#64748b" }}>
                        {s.keterangan ?? "—"}
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

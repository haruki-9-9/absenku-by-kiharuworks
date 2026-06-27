"use client";

import { useRef } from "react";

const NAMA_BULAN = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const NAMA_HARI_PENDEK = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

interface SiswaRow {
  nomorAbsen: number;
  nama: string;
  nis: string;
  absen: Record<number, string>;
  totalS: number;
  totalI: number;
  totalA: number;
  totalH: number;
  seharusnya: number;
  realisasi: number;
  persen: number;
}

interface Props {
  namaSekolah: string;
  alamatSekolah: string;
  tahunAjaran: string;
  namaKelas: string;
  bulan: number;
  tahun: number;
  jumlahHari: number;
  liburMap: Record<number, string>;
  siswaData: SiswaRow[];
}

function statusStyle(status: string | undefined, isLibur: boolean, isMinggu: boolean) {
  if (isLibur || isMinggu) {
    return {
      background: "rgba(148,163,184,0.15)",
      color: "#94a3b8",
      fontSize: 9,
      fontWeight: 500,
    };
  }
  switch (status) {
    case "S": return { background: "rgba(245,158,11,0.12)", color: "#b45309", fontWeight: 700 };
    case "I": return { background: "rgba(59,130,246,0.12)", color: "#1d4ed8", fontWeight: 700 };
    case "A": return { background: "rgba(239,68,68,0.12)", color: "#b91c1c", fontWeight: 700 };
    default: return { background: "transparent", color: "#059669", fontWeight: 600 }; // H
  }
}

export default function RekapBulananClient({
  namaSekolah, alamatSekolah, tahunAjaran, namaKelas,
  bulan, tahun, jumlahHari, liburMap, siswaData,
}: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const days = Array.from({ length: jumlahHari }, (_, i) => i + 1);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadExcel = async () => {
    const res = await fetch(
      `/api/rekap/excel/bulanan?bulan=${bulan}&tahun=${tahun}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ namaSekolah, alamatSekolah, tahunAjaran, namaKelas, bulan, tahun, jumlahHari, liburMap, siswaData }),
      }
    );
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Rekap_${namaKelas}_${NAMA_BULAN[bulan]}_${tahun}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #rekap-print, #rekap-print * { visibility: visible !important; }
          #rekap-print { position: fixed; inset: 0; padding: 16px; background: white; }
          .no-print { display: none !important; }
          @page { size: landscape; margin: 10mm; }
        }
        .btn-action:hover { opacity: 0.85; transform: translateY(-1px); }
      `}</style>

      {/* Tombol aksi */}
      <div className="no-print" style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button
          className="btn-action"
          onClick={handleDownloadExcel}
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "9px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600,
            border: "0.5px solid rgba(16,185,129,0.3)",
            background: "rgba(16,185,129,0.08)", color: "#059669",
            cursor: "pointer", transition: "all 0.2s",
          }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" width={15} height={15}>
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Download Excel
        </button>
        <button
          className="btn-action"
          onClick={handlePrint}
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "9px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            color: "#fff", border: "none",
            boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
            cursor: "pointer", transition: "all 0.2s",
          }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" width={15} height={15}>
            <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
          </svg>
          Cetak / PDF
        </button>
      </div>

      {/* Tabel rekap */}
      <div
        id="rekap-print"
        ref={printRef}
        style={{
          background: "rgba(255,255,255,0.72)", backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)", border: "0.5px solid rgba(255,255,255,0.9)",
          borderRadius: 20, boxShadow: "0 8px 32px rgba(99,102,241,0.08)",
          overflow: "hidden",
        }}
      >
        {/* Header dokumen */}
        <div style={{
          padding: "20px 28px 16px",
          borderBottom: "0.5px solid rgba(99,102,241,0.1)",
          background: "linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(139,92,246,0.05) 100%)",
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
            Rekap Absensi Bulanan
          </p>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.3px" }}>
            {namaSekolah}
          </h2>
          {alamatSekolah && (
            <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{alamatSekolah}</p>
          )}
          <div style={{ display: "flex", gap: 20, marginTop: 10, flexWrap: "wrap" }}>
            {[
              { label: "Tahun Ajaran", value: tahunAjaran },
              { label: "Kelas", value: namaKelas },
              { label: "Bulan", value: `${NAMA_BULAN[bulan]} ${tahun}` },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{item.label}:</span>
                <span style={{ fontSize: 12, color: "#0f172a", fontWeight: 700 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Legenda */}
        <div className="no-print" style={{
          padding: "10px 28px",
          borderBottom: "0.5px solid rgba(0,0,0,0.04)",
          display: "flex", gap: 16, flexWrap: "wrap",
        }}>
          {[
            { label: "H = Hadir", bg: "transparent", color: "#059669", border: "1px solid rgba(5,150,105,0.2)" },
            { label: "S = Sakit", bg: "rgba(245,158,11,0.12)", color: "#b45309", border: "none" },
            { label: "I = Izin", bg: "rgba(59,130,246,0.12)", color: "#1d4ed8", border: "none" },
            { label: "A = Alpa", bg: "rgba(239,68,68,0.12)", color: "#b91c1c", border: "none" },
            { label: "Libur", bg: "rgba(148,163,184,0.15)", color: "#94a3b8", border: "none" },
          ].map((l) => (
            <div key={l.label} style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "3px 10px", borderRadius: 6,
              background: l.bg, border: l.border || "none",
            }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: l.color }}>{l.label}</span>
            </div>
          ))}
        </div>

        {/* Tabel scroll horizontal */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", minWidth: "100%", fontSize: 11 }}>
            <thead>
              {/* Baris hari */}
              <tr style={{ background: "rgba(99,102,241,0.04)" }}>
                <th style={{ ...thBase, width: 32, minWidth: 32 }}>No</th>
                <th style={{ ...thBase, width: 160, minWidth: 140, textAlign: "left" }}>Nama Siswa</th>
                {days.map((d) => {
                  const hariIdx = new Date(tahun, bulan - 1, d).getDay();
                  const isMinggu = hariIdx === 0;
                  const isLibur = !!liburMap[d];
                  return (
                    <th key={d} style={{
                      ...thBase, width: 28, minWidth: 28,
                      color: isMinggu || isLibur ? "#94a3b8" : "#475569",
                      background: isMinggu || isLibur ? "rgba(148,163,184,0.1)" : undefined,
                      fontSize: 9,
                    }}>
                      <div>{NAMA_HARI_PENDEK[hariIdx]}</div>
                      <div style={{ fontWeight: 800, fontSize: 11, color: isMinggu || isLibur ? "#94a3b8" : "#0f172a" }}>{d}</div>
                    </th>
                  );
                })}
                <th style={{ ...thBase, width: 30, color: "#b45309", background: "rgba(245,158,11,0.06)" }}>S</th>
                <th style={{ ...thBase, width: 30, color: "#1d4ed8", background: "rgba(59,130,246,0.06)" }}>I</th>
                <th style={{ ...thBase, width: 30, color: "#b91c1c", background: "rgba(239,68,68,0.06)" }}>A</th>
                <th style={{ ...thBase, width: 44, color: "#475569" }}>Hrs</th>
                <th style={{ ...thBase, width: 44, color: "#059669" }}>Hadir</th>
                <th style={{ ...thBase, width: 44, color: "#6366f1" }}>%</th>
              </tr>
            </thead>
            <tbody>
              {siswaData.map((siswa, idx) => (
                <tr
                  key={siswa.nomorAbsen}
                  style={{
                    borderBottom: "0.5px solid rgba(0,0,0,0.04)",
                    background: idx % 2 === 0 ? "transparent" : "rgba(99,102,241,0.015)",
                  }}
                >
                  <td style={{ ...tdBase, textAlign: "center", color: "#94a3b8", fontWeight: 600 }}>
                    {siswa.nomorAbsen}
                  </td>
                  <td style={{ ...tdBase, textAlign: "left", color: "#0f172a", fontWeight: 600, paddingLeft: 12 }}>
                    {siswa.nama}
                  </td>
                  {days.map((d) => {
                    const hariIdx = new Date(tahun, bulan - 1, d).getDay();
                    const isMinggu = hariIdx === 0;
                    const isLibur = !!liburMap[d];
                    const status = siswa.absen[d];
                    const sty = statusStyle(status, isLibur, isMinggu);
                    return (
                      <td
                        key={d}
                        title={isLibur ? liburMap[d] : undefined}
                        style={{
                          ...tdBase,
                          textAlign: "center",
                          padding: "4px 2px",
                          background: sty.background,
                          color: sty.color,
                          fontWeight: sty.fontWeight,
                          fontSize: isLibur ? 8 : 11,
                        }}
                      >
                        {isMinggu ? "–" : isLibur ? "L" : (status ?? "H")}
                      </td>
                    );
                  })}
                  <td style={{ ...tdBase, textAlign: "center", background: "rgba(245,158,11,0.06)", color: "#b45309", fontWeight: 700 }}>
                    {siswa.totalS}
                  </td>
                  <td style={{ ...tdBase, textAlign: "center", background: "rgba(59,130,246,0.06)", color: "#1d4ed8", fontWeight: 700 }}>
                    {siswa.totalI}
                  </td>
                  <td style={{ ...tdBase, textAlign: "center", background: "rgba(239,68,68,0.06)", color: "#b91c1c", fontWeight: 700 }}>
                    {siswa.totalA}
                  </td>
                  <td style={{ ...tdBase, textAlign: "center", color: "#475569" }}>
                    {siswa.seharusnya}
                  </td>
                  <td style={{ ...tdBase, textAlign: "center", color: "#059669", fontWeight: 700 }}>
                    {siswa.realisasi}
                  </td>
                  <td style={{
                    ...tdBase, textAlign: "center", fontWeight: 700,
                    color: siswa.persen >= 80 ? "#059669" : siswa.persen >= 60 ? "#b45309" : "#b91c1c",
                  }}>
                    {siswa.persen}%
                  </td>
                </tr>
              ))}

              {/* Baris total */}
              {siswaData.length > 0 && (
                <tr style={{ borderTop: "1px solid rgba(99,102,241,0.15)", background: "rgba(99,102,241,0.04)" }}>
                  <td colSpan={2} style={{ ...tdBase, textAlign: "right", paddingRight: 12, fontWeight: 700, color: "#475569", fontSize: 11 }}>
                    TOTAL
                  </td>
                  {days.map((d) => (
                    <td key={d} style={{ ...tdBase }} />
                  ))}
                  <td style={{ ...tdBase, textAlign: "center", background: "rgba(245,158,11,0.1)", color: "#b45309", fontWeight: 800 }}>
                    {siswaData.reduce((s, r) => s + r.totalS, 0)}
                  </td>
                  <td style={{ ...tdBase, textAlign: "center", background: "rgba(59,130,246,0.1)", color: "#1d4ed8", fontWeight: 800 }}>
                    {siswaData.reduce((s, r) => s + r.totalI, 0)}
                  </td>
                  <td style={{ ...tdBase, textAlign: "center", background: "rgba(239,68,68,0.1)", color: "#b91c1c", fontWeight: 800 }}>
                    {siswaData.reduce((s, r) => s + r.totalA, 0)}
                  </td>
                  <td colSpan={3} style={{ ...tdBase }} />
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {siswaData.length === 0 && (
          <div style={{ padding: 48, textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "#94a3b8" }}>Belum ada data absensi untuk periode ini.</p>
          </div>
        )}
      </div>
    </>
  );
}

const thBase: React.CSSProperties = {
  padding: "8px 4px",
  textAlign: "center",
  fontWeight: 700,
  color: "#64748b",
  fontSize: 10,
  letterSpacing: "0.05em",
  borderRight: "0.5px solid rgba(0,0,0,0.04)",
  whiteSpace: "nowrap",
};

const tdBase: React.CSSProperties = {
  padding: "5px 4px",
  fontSize: 11,
  borderRight: "0.5px solid rgba(0,0,0,0.04)",
  whiteSpace: "nowrap",
};

"use client";

interface BulanItem {
  bulan: number;
  tahun: number;
  label: string;
}

interface SiswaRow {
  nomorAbsen: number;
  nama: string;
  nis: string;
  perBulan: Record<string, { S: number; I: number; A: number; efektif: number }>;
  totalS: number;
  totalI: number;
  totalA: number;
  totalEfektif: number;
  totalHadir: number;
  persen: number;
}

interface Props {
  namaSekolah: string;
  alamatSekolah: string;
  tahunAjaran: string;
  namaKelas: string;
  namaSemester: string;
  bulanList: BulanItem[];
  siswaData: SiswaRow[];
  hariEfektifPerBulan: Record<string, number>;
}

export default function RekapSemesterClient({
  namaSekolah, alamatSekolah, tahunAjaran, namaKelas, namaSemester,
  bulanList, siswaData, hariEfektifPerBulan,
}: Props) {

  const handlePrint = () => window.print();

  const handleDownloadExcel = async () => {
    const res = await fetch("/api/rekap/excel/semester", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        namaSekolah, alamatSekolah, tahunAjaran, namaKelas, namaSemester,
        bulanList, siswaData, hariEfektifPerBulan,
      }),
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Rekap_${namaKelas}_${namaSemester}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const thCell: React.CSSProperties = {
    padding: "8px 10px", fontSize: 10, fontWeight: 700,
    color: "#64748b", letterSpacing: "0.05em",
    borderRight: "0.5px solid rgba(0,0,0,0.05)",
    whiteSpace: "nowrap", textAlign: "center",
  };

  const tdCell: React.CSSProperties = {
    padding: "7px 8px", fontSize: 11,
    borderRight: "0.5px solid rgba(0,0,0,0.04)",
    textAlign: "center", whiteSpace: "nowrap",
  };

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #rekap-sem-print, #rekap-sem-print * { visibility: visible !important; }
          #rekap-sem-print { position: fixed; inset: 0; padding: 16px; background: white; }
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
        id="rekap-sem-print"
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
            Rekap Absensi Semester
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
              { label: "Semester", value: namaSemester },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{item.label}:</span>
                <span style={{ fontSize: 12, color: "#0f172a", fontWeight: 700 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabel */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", minWidth: "100%", fontSize: 11 }}>
            <thead>
              {/* Baris 1: grup bulan */}
              <tr style={{ background: "rgba(99,102,241,0.04)" }}>
                <th rowSpan={2} style={{ ...thCell, width: 32 }}>No</th>
                <th rowSpan={2} style={{ ...thCell, width: 170, textAlign: "left", paddingLeft: 14 }}>Nama Siswa</th>
                {bulanList.map((b) => (
                  <th
                    key={`${b.tahun}-${b.bulan}`}
                    colSpan={3}
                    style={{
                      ...thCell,
                      borderBottom: "0.5px solid rgba(99,102,241,0.1)",
                      color: "#6366f1",
                      background: "rgba(99,102,241,0.06)",
                      borderLeft: "1px solid rgba(99,102,241,0.12)",
                    }}
                  >
                    {b.label}
                  </th>
                ))}
                <th
                  colSpan={4}
                  style={{
                    ...thCell,
                    color: "#8b5cf6",
                    background: "rgba(139,92,246,0.08)",
                    borderLeft: "1px solid rgba(139,92,246,0.2)",
                    borderBottom: "0.5px solid rgba(139,92,246,0.15)",
                  }}
                >
                  Total Semester
                </th>
              </tr>
              {/* Baris 2: S/I/A per bulan */}
              <tr style={{ background: "rgba(99,102,241,0.02)" }}>
                {bulanList.map((b) => (
                  <>
                    <th key={`${b.tahun}-${b.bulan}-S`} style={{ ...thCell, color: "#b45309", background: "rgba(245,158,11,0.06)", borderLeft: "1px solid rgba(99,102,241,0.08)" }}>S</th>
                    <th key={`${b.tahun}-${b.bulan}-I`} style={{ ...thCell, color: "#1d4ed8", background: "rgba(59,130,246,0.06)" }}>I</th>
                    <th key={`${b.tahun}-${b.bulan}-A`} style={{ ...thCell, color: "#b91c1c", background: "rgba(239,68,68,0.06)" }}>A</th>
                  </>
                ))}
                <th style={{ ...thCell, color: "#b45309", background: "rgba(245,158,11,0.08)", borderLeft: "1px solid rgba(139,92,246,0.15)" }}>S</th>
                <th style={{ ...thCell, color: "#1d4ed8", background: "rgba(59,130,246,0.08)" }}>I</th>
                <th style={{ ...thCell, color: "#b91c1c", background: "rgba(239,68,68,0.08)" }}>A</th>
                <th style={{ ...thCell, color: "#6366f1", background: "rgba(99,102,241,0.08)" }}>%</th>
              </tr>
            </thead>
            <tbody>
              {siswaData.map((siswa, idx) => {
                const isStripe = idx % 2 !== 0;
                const stripeBg = isStripe ? "rgba(99,102,241,0.015)" : "transparent";

                return (
                  <tr
                    key={siswa.nomorAbsen}
                    style={{
                      borderBottom: "0.5px solid rgba(0,0,0,0.04)",
                      background: stripeBg,
                    }}
                  >
                    <td style={{ ...tdCell, color: "#94a3b8", fontWeight: 600 }}>{siswa.nomorAbsen}</td>
                    <td style={{ ...tdCell, textAlign: "left", paddingLeft: 14, color: "#0f172a", fontWeight: 600 }}>
                      {siswa.nama}
                    </td>

                    {bulanList.map((b) => {
                      const key = `${b.tahun}-${b.bulan}`;
                      const data = siswa.perBulan[key] ?? { S: 0, I: 0, A: 0 };
                      return (
                        <>
                          <td key={`${key}-S`} style={{ ...tdCell, color: data.S > 0 ? "#b45309" : "#cbd5e1", fontWeight: data.S > 0 ? 700 : 400, background: data.S > 0 ? "rgba(245,158,11,0.07)" : undefined, borderLeft: "1px solid rgba(99,102,241,0.06)" }}>
                            {data.S || "–"}
                          </td>
                          <td key={`${key}-I`} style={{ ...tdCell, color: data.I > 0 ? "#1d4ed8" : "#cbd5e1", fontWeight: data.I > 0 ? 700 : 400, background: data.I > 0 ? "rgba(59,130,246,0.07)" : undefined }}>
                            {data.I || "–"}
                          </td>
                          <td key={`${key}-A`} style={{ ...tdCell, color: data.A > 0 ? "#b91c1c" : "#cbd5e1", fontWeight: data.A > 0 ? 700 : 400, background: data.A > 0 ? "rgba(239,68,68,0.07)" : undefined }}>
                            {data.A || "–"}
                          </td>
                        </>
                      );
                    })}

                    {/* Total semester */}
                    <td style={{ ...tdCell, color: siswa.totalS > 0 ? "#b45309" : "#cbd5e1", fontWeight: 700, background: "rgba(245,158,11,0.06)", borderLeft: "1px solid rgba(139,92,246,0.12)" }}>
                      {siswa.totalS || "–"}
                    </td>
                    <td style={{ ...tdCell, color: siswa.totalI > 0 ? "#1d4ed8" : "#cbd5e1", fontWeight: 700, background: "rgba(59,130,246,0.06)" }}>
                      {siswa.totalI || "–"}
                    </td>
                    <td style={{ ...tdCell, color: siswa.totalA > 0 ? "#b91c1c" : "#cbd5e1", fontWeight: 700, background: "rgba(239,68,68,0.06)" }}>
                      {siswa.totalA || "–"}
                    </td>
                    <td style={{
                      ...tdCell, fontWeight: 800,
                      background: "rgba(99,102,241,0.06)",
                      color: siswa.persen >= 80 ? "#059669" : siswa.persen >= 60 ? "#b45309" : "#b91c1c",
                    }}>
                      {siswa.persen}%
                    </td>
                  </tr>
                );
              })}

              {/* Baris total */}
              {siswaData.length > 0 && (
                <tr style={{ borderTop: "1px solid rgba(99,102,241,0.15)", background: "rgba(99,102,241,0.04)" }}>
                  <td colSpan={2} style={{ ...tdCell, textAlign: "right", paddingRight: 14, fontWeight: 700, color: "#475569", fontSize: 11 }}>
                    TOTAL
                  </td>
                  {bulanList.map((b) => {
                    const key = `${b.tahun}-${b.bulan}`;
                    const totalS = siswaData.reduce((s, r) => s + (r.perBulan[key]?.S ?? 0), 0);
                    const totalI = siswaData.reduce((s, r) => s + (r.perBulan[key]?.I ?? 0), 0);
                    const totalA = siswaData.reduce((s, r) => s + (r.perBulan[key]?.A ?? 0), 0);
                    return (
                      <>
                        <td key={`${key}-S`} style={{ ...tdCell, color: "#b45309", fontWeight: 800, background: "rgba(245,158,11,0.1)", borderLeft: "1px solid rgba(99,102,241,0.08)" }}>{totalS}</td>
                        <td key={`${key}-I`} style={{ ...tdCell, color: "#1d4ed8", fontWeight: 800, background: "rgba(59,130,246,0.1)" }}>{totalI}</td>
                        <td key={`${key}-A`} style={{ ...tdCell, color: "#b91c1c", fontWeight: 800, background: "rgba(239,68,68,0.1)" }}>{totalA}</td>
                      </>
                    );
                  })}
                  <td style={{ ...tdCell, color: "#b45309", fontWeight: 800, background: "rgba(245,158,11,0.1)", borderLeft: "1px solid rgba(139,92,246,0.15)" }}>
                    {siswaData.reduce((s, r) => s + r.totalS, 0)}
                  </td>
                  <td style={{ ...tdCell, color: "#1d4ed8", fontWeight: 800, background: "rgba(59,130,246,0.1)" }}>
                    {siswaData.reduce((s, r) => s + r.totalI, 0)}
                  </td>
                  <td style={{ ...tdCell, color: "#b91c1c", fontWeight: 800, background: "rgba(239,68,68,0.1)" }}>
                    {siswaData.reduce((s, r) => s + r.totalA, 0)}
                  </td>
                  <td style={{ ...tdCell, background: "rgba(99,102,241,0.08)" }} />
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {siswaData.length === 0 && (
          <div style={{ padding: 48, textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "#94a3b8" }}>Belum ada data absensi untuk semester ini.</p>
          </div>
        )}
      </div>
    </>
  );
}

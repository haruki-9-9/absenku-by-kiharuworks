"use client";

import { useState } from "react";

const NAMA_HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const NAMA_BULAN = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

interface SiswaItem {
  nama: string;
  jenisKelamin: string;
  nomorAbsen: number;
}

interface KelasItem {
  id: string;
  nama: string;
  programKeahlian: string | null;
  tahunAjaran: string;
  namaWaliKelas: string | null;
  siswa: SiswaItem[];
}

interface Props {
  kelasList: KelasItem[];
  namaSekolah: string;
  alamatSekolah: string;
  defaultKelasId: string;
  defaultTanggalMulai: string;
}

function getMondayOfWeek(dateStr: string): Date {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  return monday;
}

function getWeekDays(monday: Date): Date[] {
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatTgl(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export default function GenerateAbsensiClient({
  kelasList, namaSekolah, alamatSekolah,
  defaultKelasId, defaultTanggalMulai,
}: Props) {
  const [kelasId, setKelasId] = useState(defaultKelasId);
  const [tanggalMulai, setTanggalMulai] = useState(defaultTanggalMulai);
  const [loading, setLoading] = useState(false);
  const [showPrint, setShowPrint] = useState(false);

  const selectedKelas = kelasList.find((k) => k.id === kelasId) ?? null;
  const monday = tanggalMulai ? getMondayOfWeek(tanggalMulai) : null;
  const weekDays = monday ? getWeekDays(monday) : [];
  const bulanMinggu = monday ? `${NAMA_BULAN[monday.getMonth() + 1]} ${monday.getFullYear()}` : "";
  const sortedSiswa = selectedKelas
    ? [...selectedKelas.siswa].sort((a, b) => a.nomorAbsen - b.nomorAbsen)
    : [];

  const inputStyle = {
    background: "rgba(255,255,255,0.6)",
    border: "0.5px solid rgba(99,102,241,0.2)",
    borderRadius: 10, padding: "10px 14px",
    fontSize: 13, color: "#0f172a", outline: "none",
    width: "100%", boxSizing: "border-box" as const,
  };

  const handleDownload = async () => {
    if (!selectedKelas || !monday) return;
    setLoading(true);
    try {
      const payload = {
        namaSekolah, alamatSekolah,
        namaKelas: selectedKelas.nama,
        programKeahlian: selectedKelas.programKeahlian,
        tahunAjaran: selectedKelas.tahunAjaran,
        namaWaliKelas: selectedKelas.namaWaliKelas,
        siswa: selectedKelas.siswa,
        tanggalMulai: monday.toISOString(),
      };
      const res = await fetch("/api/generate-absensi/excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { alert("Gagal generate file."); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const tglStr = `${String(monday.getDate()).padStart(2,"0")}-${String(monday.getMonth()+1).padStart(2,"0")}-${monday.getFullYear()}`;
      a.download = `Form_Absensi_${selectedKelas.nama.replace(/\s+/g, "_")}_${tglStr}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    setShowPrint(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setShowPrint(false), 500);
    }, 100);
  };

  const canGenerate = !!kelasId && !!tanggalMulai;

  // Hitung L/P
  const jumlahL = sortedSiswa.filter(s => s.jenisKelamin === "L").length;
  const jumlahP = sortedSiswa.filter(s => s.jenisKelamin !== "L").length;

  const tempatTgl = monday
    ? `${namaSekolah.split(" ")[0] || "Sekolah"}, ${String(monday.getDate()).padStart(2,"0")} ${NAMA_BULAN[monday.getMonth()+1]} ${monday.getFullYear()}`
    : "";

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #form-absensi-print, #form-absensi-print * { visibility: visible !important; }
          #form-absensi-print {
            position: fixed; inset: 0;
            background: white;
            padding: 8mm;
          }
          .no-print { display: none !important; }
          @page { size: F4 landscape; margin: 8mm; }
        }
        .btn-generate:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .btn-print:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Form pilih kelas & minggu */}
        <div className="no-print" style={{
          background: "rgba(255,255,255,0.65)", backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)", border: "0.5px solid rgba(255,255,255,0.9)",
          borderRadius: 20, padding: 24, boxShadow: "0 8px 32px rgba(99,102,241,0.08)",
          display: "flex", flexDirection: "column", gap: 16,
        }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Pilih Kelas &amp; Minggu
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Kelas</label>
              <select value={kelasId} onChange={(e) => setKelasId(e.target.value)} style={inputStyle}>
                <option value="">Pilih kelas</option>
                {kelasList.map((k) => (
                  <option key={k.id} value={k.id}>{k.nama}</option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>
                Tanggal (pilih hari apapun dalam minggu itu)
              </label>
              <input
                type="date"
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {monday && (
            <div style={{
              background: "rgba(99,102,241,0.06)", borderRadius: 10, padding: "10px 14px",
              fontSize: 12, color: "#6366f1", fontWeight: 500,
            }}>
              Minggu: {NAMA_HARI[monday.getDay()]} {formatTgl(monday)} &ndash; {NAMA_HARI[weekDays[weekDays.length-1].getDay()]} {formatTgl(weekDays[weekDays.length-1])}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              className="btn-generate"
              onClick={handleDownload}
              disabled={!canGenerate || loading}
              style={{
                padding: "11px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600,
                background: (!canGenerate || loading) ? "rgba(16,185,129,0.3)" : "rgba(16,185,129,0.9)",
                color: "#fff", border: "none",
                cursor: (!canGenerate || loading) ? "not-allowed" : "pointer",
                boxShadow: "0 4px 16px rgba(16,185,129,0.2)", transition: "all 0.2s",
                display: "inline-flex", alignItems: "center", gap: 7,
              }}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" width={15} height={15}>
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              {loading ? "Generating..." : "Download Excel"}
            </button>

            <button
              className="btn-print"
              onClick={handlePrint}
              disabled={!canGenerate}
              style={{
                padding: "11px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600,
                background: !canGenerate ? "rgba(99,102,241,0.3)" : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                color: "#fff", border: "none",
                cursor: !canGenerate ? "not-allowed" : "pointer",
                boxShadow: "0 4px 16px rgba(99,102,241,0.3)", transition: "all 0.2s",
                display: "inline-flex", alignItems: "center", gap: 7,
              }}
            >
              <svg viewBox="0 0 20 20" fill="currentColor" width={15} height={15}>
                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a1 1 0 001 1h8a1 1 0 001-1v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a1 1 0 00-1-1H6a1 1 0 00-1 1zm2 0h6v3H7V4zm-1 9h8v4H6v-4zm8-4a1 1 0 110 2 1 1 0 010-2z" clipRule="evenodd" />
              </svg>
              Print / PDF
            </button>
          </div>
        </div>

        {/* Preview info (non-print) */}
        {selectedKelas && monday && (
          <div className="no-print" style={{
            background: "rgba(255,255,255,0.65)", backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)", border: "0.5px solid rgba(255,255,255,0.9)",
            borderRadius: 20, padding: 24, boxShadow: "0 8px 32px rgba(99,102,241,0.08)",
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>
              Preview Info Form
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12, color: "#475569" }}>
              <div><span style={{ fontWeight: 600 }}>Sekolah:</span> {namaSekolah}</div>
              <div><span style={{ fontWeight: 600 }}>Kelas:</span> {selectedKelas.nama}</div>
              {selectedKelas.programKeahlian && (
                <div style={{ gridColumn: "span 2" }}>
                  <span style={{ fontWeight: 600 }}>Program Keahlian:</span> {selectedKelas.programKeahlian}
                </div>
              )}
              <div><span style={{ fontWeight: 600 }}>Tahun Pelajaran:</span> {selectedKelas.tahunAjaran}</div>
              <div><span style={{ fontWeight: 600 }}>Bulan:</span> {bulanMinggu}</div>
              <div><span style={{ fontWeight: 600 }}>Wali Kelas:</span> {selectedKelas.namaWaliKelas ?? "-"}</div>
              <div><span style={{ fontWeight: 600 }}>Jumlah Siswa:</span> {selectedKelas.siswa.length} orang</div>
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
              Output: F4 landscape, 5 hari (Senin–Jumat), 4 jam per hari, sel kosong untuk diisi manual.
            </div>
          </div>
        )}

        {/* Area print — hanya muncul saat print */}
        {(showPrint && selectedKelas && monday) && (
          <div id="form-absensi-print" style={{ background: "white", fontFamily: "Arial, sans-serif" }}>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase" }}>
                DAFTAR HADIR HARIAN SISWA
              </div>
            </div>

            {/* Info sekolah */}
            <table style={{ width: "100%", fontSize: 9, marginBottom: 6, borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td style={{ width: "50%" }}>
                    {selectedKelas.programKeahlian && (
                      <div>Kompetensi Keahlian &nbsp;: {selectedKelas.programKeahlian}</div>
                    )}
                    <div>Nama Sekolah &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {namaSekolah}</div>
                  </td>
                  <td style={{ width: "50%" }}>
                    <div>Kelas /Sem &nbsp;&nbsp;&nbsp;&nbsp;: {selectedKelas.nama} /</div>
                    <div>Th. Pelajaran &nbsp;: {selectedKelas.tahunAjaran}</div>
                    <div>Bulan &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {bulanMinggu.toUpperCase()}</div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Tabel absensi */}
            <table style={{
              width: "100%", borderCollapse: "collapse", fontSize: 8,
            }}>
              <thead>
                {/* Baris 1: header utama */}
                <tr style={{ background: "#e0e7ff" }}>
                  <th rowSpan={4} style={{ ...thPrint, width: 20 }}>No</th>
                  <th rowSpan={4} style={{ ...thPrint, width: 100, textAlign: "left", paddingLeft: 4 }}>Nama Siswa</th>
                  <th rowSpan={4} style={{ ...thPrint, width: 14 }}>L/P</th>
                  {weekDays.map((d, i) => (
                    <th key={i} colSpan={4} style={{ ...thPrint }}>{NAMA_HARI[d.getDay()]}</th>
                  ))}
                  <th colSpan={4} rowSpan={4} style={{ ...thPrint }}>Absensi</th>
                </tr>
                {/* Baris 2: tanggal */}
                <tr style={{ background: "#f5f5ff" }}>
                  {weekDays.map((d, i) => (
                    <th key={i} colSpan={4} style={{ ...thPrint, fontSize: 7 }}>
                      Tgl:{String(d.getDate()).padStart(2,"0")}/{String(d.getMonth()+1).padStart(2,"0")}/{d.getFullYear()}
                    </th>
                  ))}
                </tr>
                {/* Baris 3: Jam Ke */}
                <tr style={{ background: "#f5f5ff" }}>
                  {weekDays.map((_, i) => (
                    <th key={i} colSpan={4} style={{ ...thPrint, fontSize: 7 }}>Jam Ke</th>
                  ))}
                </tr>
                {/* Baris 4: 1 2 3 4 + S I A Jml */}
                <tr style={{ background: "#f5f5ff" }}>
                  {weekDays.map((_, hi) => (
                    [1,2,3,4].map(j => (
                      <th key={`${hi}-${j}`} style={{ ...thPrint, fontSize: 7, color: "#6366f1" }}>{j}</th>
                    ))
                  ))}
                  {["S","I","A","Jml"].map(l => (
                    <th key={l} style={{ ...thPrint, background: "#6366f1", color: "#fff", fontSize: 7 }}>{l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedSiswa.map((s, i) => (
                  <tr key={i} style={{ background: i % 2 === 1 ? "#f8fafc" : "white" }}>
                    <td style={{ ...tdPrint, textAlign: "center" }}>{s.nomorAbsen}</td>
                    <td style={{ ...tdPrint, paddingLeft: 4 }}>{s.nama}</td>
                    <td style={{ ...tdPrint, textAlign: "center" }}>{s.jenisKelamin}</td>
                    {Array.from({ length: 20 }).map((_, ci) => (
                      <td key={ci} style={{ ...tdPrint, minWidth: 10 }}></td>
                    ))}
                    {[0,1,2,3].map(ci => (
                      <td key={ci} style={{ ...tdPrint, minWidth: 12 }}></td>
                    ))}
                  </tr>
                ))}
                {/* Baris jumlah harian */}
                {["S","I","A"].map((label, li) => (
                  <tr key={label}>
                    {li === 0 && <td colSpan={2} rowSpan={3} style={{ ...tdPrint, fontSize: 7, fontWeight: 700, paddingLeft: 4 }}>JUMLAH HARIAN</td>}
                    <td style={{ ...tdPrint, textAlign: "center", fontWeight: 700, fontSize: 7 }}>{label}</td>
                    {Array.from({ length: 20 }).map((_, ci) => (
                      <td key={ci} style={{ ...tdPrint }}></td>
                    ))}
                    <td style={{ ...tdPrint, textAlign: "center", fontWeight: 700, fontSize: 7 }}>
                      {label === "S" ? "L" : label === "I" ? "P" : "JT"}
                    </td>
                    <td style={{ ...tdPrint, textAlign: "center", fontSize: 7 }}>
                      {label === "S" ? jumlahL : label === "I" ? jumlahP : sortedSiswa.length}
                    </td>
                    <td colSpan={2} style={{ ...tdPrint }}></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer */}
            <table style={{ width: "100%", marginTop: 16, fontSize: 9, borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td style={{ width: "60%" }}></td>
                  <td style={{ width: "40%", textAlign: "center" }}>
                    <div>{tempatTgl}</div>
                    <div style={{ marginTop: 2 }}>Wali Kelas</div>
                    <div style={{ marginTop: 40, fontWeight: 700, textDecoration: "underline" }}>
                      {selectedKelas.namaWaliKelas ?? ""}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

const thPrint: React.CSSProperties = {
  border: "0.5px solid #d1d5db",
  padding: "3px 2px",
  textAlign: "center",
  fontWeight: 700,
  fontSize: 8,
  background: "#e0e7ff",
};

const tdPrint: React.CSSProperties = {
  border: "0.5px solid #d1d5db",
  padding: "3px 2px",
  fontSize: 8,
  height: 16,
};

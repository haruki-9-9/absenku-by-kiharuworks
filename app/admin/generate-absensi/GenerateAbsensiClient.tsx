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
  const day = d.getDay(); // 0=Minggu
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

  const selectedKelas = kelasList.find((k) => k.id === kelasId) ?? null;

  const monday = tanggalMulai ? getMondayOfWeek(tanggalMulai) : null;
  const weekDays = monday ? getWeekDays(monday) : [];

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
        namaSekolah,
        alamatSekolah,
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

  const bulanMinggu = monday
    ? `${NAMA_BULAN[monday.getMonth() + 1]} ${monday.getFullYear()}`
    : "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Form pilih kelas & minggu */}
      <div style={{
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

        <button
          onClick={handleDownload}
          disabled={!kelasId || !tanggalMulai || loading}
          style={{
            padding: "11px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600,
            background: (!kelasId || !tanggalMulai || loading)
              ? "rgba(99,102,241,0.4)"
              : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            color: "#fff", border: "none",
            cursor: (!kelasId || !tanggalMulai || loading) ? "not-allowed" : "pointer",
            boxShadow: "0 4px 16px rgba(99,102,241,0.3)", alignSelf: "flex-start",
          }}
        >
          {loading ? "Generating..." : "Download Form Absensi (.xlsx)"}
        </button>
      </div>

      {/* Preview info */}
      {selectedKelas && monday && (
        <div style={{
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
            <div><span style={{ fontWeight: 600 }}>Kelas/Sem:</span> {selectedKelas.nama}</div>
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
    </div>
  );
}

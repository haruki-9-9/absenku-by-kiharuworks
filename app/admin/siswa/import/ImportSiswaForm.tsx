"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { generateTemplateAction, importSiswaAction } from "./actions";

type Kelas = { id: string; nama: string };
type ImportRowError = { baris: number; alasan: string };
type ImportResult = {
  success: boolean;
  message: string;
  totalBerhasil?: number;
  totalGagal?: number;
  errors?: ImportRowError[];
};

const cardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.65)", backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)", border: "0.5px solid rgba(255,255,255,0.9)",
  borderRadius: 20, padding: "24px", boxShadow: "0 8px 32px rgba(99,102,241,0.08)",
};

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.6)", border: "0.5px solid rgba(99,102,241,0.2)",
  borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#0f172a",
  outline: "none", width: "100%", boxSizing: "border-box",
};

export default function ImportSiswaForm({ kelasList }: { kelasList: Kelas[] }) {
  const [selectedKelasId, setSelectedKelasId] = useState(kelasList[0]?.id ?? "");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [fileName, setFileName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ImportResult | null>(null);

  async function handleDownloadTemplate() {
    if (!selectedKelasId) return;
    setIsDownloading(true);
    setDownloadError("");
    const res = await generateTemplateAction(selectedKelasId);
    setIsDownloading(false);

    if (!res.success) { setDownloadError(res.message); return; }

    const byteChars = atob(res.base64);
    const byteNumbers = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
    const blob = new Blob([new Uint8Array(byteNumbers)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = res.filename;
    document.body.appendChild(link); link.click();
    document.body.removeChild(link); URL.revokeObjectURL(url);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("kelasId", selectedKelasId);
    startTransition(async () => {
      const res = await importSiswaAction(formData);
      setResult(res);
      if (res.success) { form.reset(); setFileName(""); }
    });
  }

  const namaKelas = kelasList.find((k) => k.id === selectedKelasId)?.nama ?? "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 640 }}>
      <div>
        <Link href="/admin/siswa" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#94a3b8", textDecoration: "none", marginBottom: 16 }}>
          <svg viewBox="0 0 20 20" fill="currentColor" width={14} height={14}>
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Kembali ke Daftar Siswa
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
          Import Siswa via Excel
        </h1>
        <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
          Tambahkan banyak siswa sekaligus ke satu kelas menggunakan file Excel.
        </p>
      </div>

      {/* Pilih Kelas */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0, marginBottom: 12 }}>
          Pilih Kelas Tujuan
        </h2>
        {kelasList.length === 0 ? (
          <div style={{ padding: "10px 14px", borderRadius: 10, fontSize: 12, background: "rgba(245,158,11,0.08)", border: "0.5px solid rgba(245,158,11,0.2)", color: "#b45309" }}>
            Belum ada kelas aktif. <Link href="/admin/kelas/tambah" style={{ color: "#6366f1", fontWeight: 600 }}>Tambah kelas</Link> terlebih dahulu.
          </div>
        ) : (
          <select
            value={selectedKelasId}
            onChange={(e) => { setSelectedKelasId(e.target.value); setResult(null); }}
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            {kelasList.map((k) => (
              <option key={k.id} value={k.id}>{k.nama}</option>
            ))}
          </select>
        )}
      </div>

      {/* Step 1: Download Template */}
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>
              1. Download Template
            </h2>
            <p style={{ fontSize: 12, color: "#64748b", marginTop: 4, lineHeight: 1.5 }}>
              Template untuk kelas <strong style={{ color: "#6366f1" }}>{namaKelas}</strong>. Isi kolom{" "}
              <strong>Nama Siswa, Jenis Kelamin, NIS</strong>. Kolom Jenis Kelamin sudah berupa dropdown.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            disabled={isDownloading || !selectedKelasId}
            style={{
              flexShrink: 0, padding: "10px 18px", borderRadius: 12, fontSize: 13, fontWeight: 600,
              background: isDownloading ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              color: "#fff", border: "none", cursor: isDownloading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 16px rgba(99,102,241,0.3)", transition: "all 0.2s", whiteSpace: "nowrap",
            }}
          >
            {isDownloading ? "Menyiapkan..." : "Download Template"}
          </button>
        </div>
        {downloadError && (
          <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 10, fontSize: 12, background: "rgba(239,68,68,0.08)", border: "0.5px solid rgba(239,68,68,0.2)", color: "#dc2626" }}>
            {downloadError}
          </div>
        )}
      </div>

      {/* Step 2: Upload */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0, marginBottom: 4 }}>
          2. Upload File yang Sudah Diisi
        </h2>
        <p style={{ fontSize: 12, color: "#64748b", marginTop: 0, marginBottom: 16, lineHeight: 1.5 }}>
          Siswa akan diimport ke kelas <strong style={{ color: "#6366f1" }}>{namaKelas}</strong>. Nomor absen diurutkan otomatis secara alfabetis.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>
              File Excel (.xlsx) <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              name="file" type="file" accept=".xlsx" required
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
              style={{ ...inputStyle, cursor: "pointer", padding: "8px 14px" }}
            />
            {fileName && <span style={{ fontSize: 11, color: "#6366f1" }}>{fileName}</span>}
          </div>

          <button
            type="submit"
            disabled={isPending || !selectedKelasId}
            style={{
              padding: "11px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600,
              background: isPending ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              color: "#fff", border: "none", cursor: isPending ? "not-allowed" : "pointer",
              boxShadow: "0 4px 16px rgba(99,102,241,0.3)", transition: "all 0.2s",
            }}
          >
            {isPending ? "Memproses..." : "Import Siswa"}
          </button>
        </form>
      </div>

      {/* Hasil Import */}
      {result && (
        <div style={cardStyle}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0, marginBottom: 12 }}>
            Hasil Import
          </h2>
          <div style={{
            padding: "10px 14px", borderRadius: 10, fontSize: 12,
            marginBottom: result.errors?.length ? 16 : 0,
            background: result.success ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
            border: `0.5px solid ${result.success ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
            color: result.success ? "#059669" : "#dc2626",
          }}>
            {result.message}
          </div>

          {typeof result.totalBerhasil === "number" && (
            <div style={{ display: "flex", gap: 12, marginBottom: result.errors?.length ? 16 : 0 }}>
              <div style={{ flex: 1, padding: "12px 16px", borderRadius: 12, background: "rgba(16,185,129,0.08)", border: "0.5px solid rgba(16,185,129,0.2)" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#059669" }}>{result.totalBerhasil}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>Berhasil diimport</div>
              </div>
              <div style={{ flex: 1, padding: "12px 16px", borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "0.5px solid rgba(239,68,68,0.2)" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#dc2626" }}>{result.totalGagal ?? 0}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>Gagal / dilewati</div>
              </div>
            </div>
          )}

          {result.errors && result.errors.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 280, overflowY: "auto" }}>
              {result.errors.map((err, idx) => (
                <div key={idx} style={{ display: "flex", gap: 10, padding: "8px 12px", borderRadius: 8, background: "rgba(239,68,68,0.05)", border: "0.5px solid rgba(239,68,68,0.15)", fontSize: 12 }}>
                  <span style={{ fontWeight: 700, color: "#dc2626", flexShrink: 0 }}>Baris {err.baris}</span>
                  <span style={{ color: "#64748b" }}>{err.alasan}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

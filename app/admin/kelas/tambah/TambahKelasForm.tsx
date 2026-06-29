"use client";

import { useActionState } from "react";
import { tambahKelasAction } from "../actions";
import Link from "next/link";

const initialState = { success: false, message: "" };

type TahunAjaran = { id: string; nama: string };

export default function TambahKelasForm({ tahunAjaranList }: { tahunAjaranList: TahunAjaran[] }) {
  const [state, formAction, isPending] = useActionState(tambahKelasAction, initialState);

  const inputStyle = {
    background: "rgba(255,255,255,0.6)",
    border: "0.5px solid rgba(99,102,241,0.2)",
    borderRadius: 10, padding: "10px 14px",
    fontSize: 13, color: "#0f172a", outline: "none",
    width: "100%", boxSizing: "border-box" as const,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 480 }}>
      <div>
        <Link href="/admin/kelas" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 12, color: "#94a3b8", textDecoration: "none", marginBottom: 16,
        }}>
          <svg viewBox="0 0 20 20" fill="currentColor" width={14} height={14}>
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Kembali ke Daftar Kelas
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
          Tambah Kelas
        </h1>
        <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
          Buat kelas baru untuk sekolah Anda.
        </p>
      </div>

      {tahunAjaranList.length === 0 ? (
        <div style={{
          background: "rgba(255,255,255,0.65)", backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)", border: "0.5px solid rgba(255,255,255,0.9)",
          borderRadius: 20, padding: 24, boxShadow: "0 8px 32px rgba(99,102,241,0.08)",
        }}>
          <p style={{ fontSize: 13, color: "#94a3b8", textAlign: "center" }}>
            Belum ada tahun ajaran.{" "}
            <Link href="/admin/tahun-ajaran/tambah" style={{ color: "#6366f1", textDecoration: "none", fontWeight: 600 }}>
              Buat tahun ajaran dulu
            </Link>
            {" "}sebelum menambah kelas.
          </p>
        </div>
      ) : (
        <div style={{
          background: "rgba(255,255,255,0.65)", backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)", border: "0.5px solid rgba(255,255,255,0.9)",
          borderRadius: 20, padding: 24, boxShadow: "0 8px 32px rgba(99,102,241,0.08)",
        }}>
          <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>
                Tahun Ajaran <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select name="tahunAjaranId" required style={inputStyle}>
                <option value="">Pilih tahun ajaran</option>
                {tahunAjaranList.map((ta) => (
                  <option key={ta.id} value={ta.id}>{ta.nama}</option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>
                Nama Kelas <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                name="nama"
                type="text"
                placeholder="Contoh: X TKJ, XI IPA 1, VII A"
                required
                style={inputStyle}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>
                Program / Kompetensi Keahlian
                <span style={{ color: "#94a3b8", fontWeight: 400, marginLeft: 4 }}>(opsional, khusus SMK)</span>
              </label>
              <input
                name="programKeahlian"
                type="text"
                placeholder="Contoh: Teknik Kendaraan Ringan (TKR)"
                style={inputStyle}
              />
            </div>

            {state.message && (
              <div style={{
                padding: "10px 14px", borderRadius: 10, fontSize: 12,
                background: state.success ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
                border: `0.5px solid ${state.success ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
                color: state.success ? "#059669" : "#dc2626",
              }}>
                {state.message}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              style={{
                padding: "11px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600,
                background: isPending ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                color: "#fff", border: "none", cursor: isPending ? "not-allowed" : "pointer",
                boxShadow: "0 4px 16px rgba(99,102,241,0.3)", transition: "all 0.2s",
              }}
            >
              {isPending ? "Menyimpan..." : "Tambah Kelas"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

"use client";

import { useActionState } from "react";
import { tambahSiswaAction } from "../actions";
import Link from "next/link";

const initialState = { success: false, message: "" };

type Kelas = { id: string; nama: string };

export default function TambahSiswaForm({ kelasList }: { kelasList: Kelas[] }) {
  const [state, formAction, isPending] = useActionState(tambahSiswaAction, initialState);

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.6)",
    border: "0.5px solid rgba(99,102,241,0.2)",
    borderRadius: 10, padding: "10px 14px",
    fontSize: 13, color: "#0f172a", outline: "none",
    width: "100%", boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: "#475569",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 480 }}>
      <style>{`.ts-input:focus { border-color: rgba(99,102,241,0.5) !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.08) !important; }`}</style>

      <div>
        <Link
          href="/admin/siswa"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#94a3b8", textDecoration: "none", marginBottom: 16 }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" width={14} height={14}>
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Kembali ke Daftar Siswa
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
          Tambah Siswa
        </h1>
        <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
          Daftarkan siswa baru ke sekolah Anda.
        </p>
      </div>

      <div style={{
        background: "rgba(255,255,255,0.65)", backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)", border: "0.5px solid rgba(255,255,255,0.9)",
        borderRadius: 20, padding: "24px", boxShadow: "0 8px 32px rgba(99,102,241,0.08)",
      }}>
        <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Nama */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={labelStyle}>Nama Lengkap <span style={{ color: "#ef4444" }}>*</span></label>
            <input name="nama" type="text" placeholder="Nama lengkap siswa" required className="ts-input" style={inputStyle} />
          </div>

          {/* Jenis Kelamin */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={labelStyle}>Jenis Kelamin <span style={{ color: "#ef4444" }}>*</span></label>
            <select name="jenisKelamin" required className="ts-input" style={{ ...inputStyle, cursor: "pointer" }}>
              <option value="">Pilih jenis kelamin</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>

          {/* NIS */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={labelStyle}>NIS <span style={{ color: "#ef4444" }}>*</span></label>
            <input name="nis" type="text" placeholder="Nomor Induk Siswa" required className="ts-input" style={inputStyle} />
          </div>

          {/* Kelas */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={labelStyle}>Kelas <span style={{ color: "#ef4444" }}>*</span></label>
            {kelasList.length === 0 ? (
              <div style={{
                padding: "10px 14px", borderRadius: 10, fontSize: 12,
                background: "rgba(245,158,11,0.08)", border: "0.5px solid rgba(245,158,11,0.2)",
                color: "#b45309",
              }}>
                Belum ada kelas aktif. <Link href="/admin/kelas/tambah" style={{ color: "#6366f1", fontWeight: 600 }}>Tambah kelas</Link> terlebih dahulu.
              </div>
            ) : (
              <select name="kelasId" required className="ts-input" style={{ ...inputStyle, cursor: "pointer" }}>
                <option value="">Pilih kelas</option>
                {kelasList.map((k) => (
                  <option key={k.id} value={k.id}>{k.nama}</option>
                ))}
              </select>
            )}
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
            disabled={isPending || kelasList.length === 0}
            style={{
              padding: "11px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600,
              background: isPending ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              color: "#fff", border: "none", cursor: isPending ? "not-allowed" : "pointer",
              boxShadow: "0 4px 16px rgba(99,102,241,0.3)", transition: "all 0.2s",
            }}
          >
            {isPending ? "Menyimpan..." : "Tambah Siswa"}
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useActionState } from "react";
import { tambahSekolahAction } from "@/app/developer/sekolah/tambah/actions";

const initialState = { success: false, message: "" };

const inputStyle = {
  width: "100%",
  borderRadius: 10,
  border: "0.5px solid rgba(99,102,241,0.2)",
  background: "rgba(255,255,255,0.6)",
  backdropFilter: "blur(8px)",
  padding: "10px 14px",
  fontSize: 13,
  color: "#0f172a",
  outline: "none",
  transition: "border 0.2s, box-shadow 0.2s",
  boxSizing: "border-box" as const,
};

const labelStyle = {
  display: "block",
  fontSize: 10,
  fontWeight: 700,
  color: "#94a3b8",
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  marginBottom: 6,
};

const sectionStyle = {
  background: "rgba(255,255,255,0.65)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "0.5px solid rgba(255,255,255,0.9)",
  borderRadius: 20,
  boxShadow: "0 8px 32px rgba(99,102,241,0.08)",
  padding: "24px",
  display: "flex",
  flexDirection: "column" as const,
  gap: 16,
};

const sectionTitleStyle = {
  fontSize: 13,
  fontWeight: 700,
  color: "#0f172a",
  paddingBottom: 12,
  borderBottom: "0.5px solid rgba(99,102,241,0.1)",
  marginBottom: 4,
};

export default function TambahSekolahForm() {
  const [state, formAction, pending] = useActionState(tambahSekolahAction, initialState);

  return (
    <>
      <style>{`
        .absenku-input:focus {
          border-color: rgba(99,102,241,0.5) !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.08) !important;
        }
        .absenku-input::placeholder { color: #cbd5e1; }
        .ts-tanggal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .ts-actions { display: flex; align-items: center; gap: 12px; }
        @media (max-width: 768px) {
          .ts-tanggal-grid { grid-template-columns: 1fr; }
          .ts-actions { flex-direction: column; }
          .ts-actions a, .ts-actions button { width: 100%; text-align: center; }
        }
      `}</style>

      <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 640 }}>

        {/* Error message */}
        {state.message && (
          <div style={{
            borderRadius: 12, padding: "12px 16px", fontSize: 13,
            background: "rgba(239,68,68,0.08)", border: "0.5px solid rgba(239,68,68,0.3)",
            color: "#dc2626",
          }}>
            {state.message}
          </div>
        )}

        {/* Data Sekolah */}
        <div style={sectionStyle}>
          <p style={sectionTitleStyle}>Data Sekolah</p>

          <div>
            <label style={labelStyle}>Nama Sekolah <span style={{ color: "#ef4444" }}>*</span></label>
            <input
              name="nama" type="text" required
              placeholder="SMK Negeri 1 Bandung"
              className="absenku-input"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Alamat</label>
            <input
              name="alamat" type="text"
              placeholder="Jl. Contoh No. 1, Bandung"
              className="absenku-input"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Akun Admin Sekolah */}
        <div style={sectionStyle}>
          <p style={sectionTitleStyle}>Akun Admin Sekolah</p>

          <div>
            <label style={labelStyle}>Nama Admin <span style={{ color: "#ef4444" }}>*</span></label>
            <input
              name="namaAdmin" type="text" required
              placeholder="Budi Santoso"
              className="absenku-input"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Email Admin <span style={{ color: "#ef4444" }}>*</span></label>
            <input
              name="emailAdmin" type="email" required
              placeholder="admin@smkn1bandung.sch.id"
              className="absenku-input"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Password Admin <span style={{ color: "#ef4444" }}>*</span></label>
            <input
              name="passwordAdmin" type="password" required
              placeholder="Minimal 8 karakter"
              className="absenku-input"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Periode Langganan */}
        <div style={sectionStyle}>
          <p style={sectionTitleStyle}>Periode Langganan</p>

          <div>
            <label style={labelStyle}>Paket <span style={{ color: "#ef4444" }}>*</span></label>
            <select
              name="paket" required
              className="absenku-input"
              style={inputStyle}
            >
              <option value="STARTER">Starter — s/d 6 kelas</option>
              <option value="BASIC">Basic — s/d 12 kelas</option>
              <option value="PRO">Pro — s/d 24 kelas</option>
              <option value="ENTERPRISE">Enterprise — Unlimited</option>
            </select>
          </div>

          <div className="ts-tanggal-grid">
            <div>
              <label style={labelStyle}>Tanggal Mulai <span style={{ color: "#ef4444" }}>*</span></label>
              <input
                name="tanggalMulai" type="date" required
                className="absenku-input"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Tanggal Berakhir <span style={{ color: "#ef4444" }}>*</span></label>
              <input
                name="tanggalBerakhir" type="date" required
                className="absenku-input"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="ts-actions">
          <button
            type="submit"
            disabled={pending}
            style={{
              padding: "10px 24px", borderRadius: 12, fontSize: 13, fontWeight: 700,
              background: pending
                ? "rgba(99,102,241,0.4)"
                : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              color: "#fff", border: "none", cursor: pending ? "not-allowed" : "pointer",
              boxShadow: pending ? "none" : "0 4px 16px rgba(99,102,241,0.3)",
              transition: "all 0.2s",
            }}
          >
            {pending ? "Menyimpan..." : "Simpan Sekolah"}
          </button>
          <Link href="/developer/sekolah"
            style={{
              padding: "10px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600,
              background: "rgba(255,255,255,0.6)", color: "#64748b",
              border: "0.5px solid rgba(99,102,241,0.15)",
              textDecoration: "none", transition: "all 0.2s",
            }}
          >
            Batal
          </Link>
        </div>
      </form>
    </>
  );
}

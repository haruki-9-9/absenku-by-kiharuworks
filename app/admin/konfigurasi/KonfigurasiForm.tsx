"use client";

import { useActionState } from "react";
import { simpanKonfigurasiAction } from "./actions";

const initialState = { success: false, message: "" };

const zonaWaktuOptions = [
  { value: "Asia/Jakarta", label: "WIB — Asia/Jakarta (UTC+7)" },
  { value: "Asia/Makassar", label: "WITA — Asia/Makassar (UTC+8)" },
  { value: "Asia/Jayapura", label: "WIT — Asia/Jayapura (UTC+9)" },
];

type Konfigurasi = {
  jamLock: string;
  batasAlpa: number;
  zonaWaktu: string;
};

export default function KonfigurasiForm({ konfigurasi }: { konfigurasi: Konfigurasi }) {
  const [state, formAction, isPending] = useActionState(simpanKonfigurasiAction, initialState);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 520 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
          Konfigurasi
        </h1>
        <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
          Pengaturan operasional sekolah Anda.
        </p>
      </div>

      <div style={{
        background: "rgba(255,255,255,0.65)", backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)", border: "0.5px solid rgba(255,255,255,0.9)",
        borderRadius: 20, padding: "24px", boxShadow: "0 8px 32px rgba(99,102,241,0.08)",
      }}>
        <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Jam Lock */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>
              Jam Lock Absensi
            </label>
            <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>
              Setelah jam ini, Petugas Absensi tidak bisa lagi input absensi harian.
            </p>
            <input
              name="jamLock"
              type="time"
              defaultValue={konfigurasi.jamLock}
              required
              style={{
                background: "rgba(255,255,255,0.6)",
                border: "0.5px solid rgba(99,102,241,0.2)",
                borderRadius: 10, padding: "10px 14px",
                fontSize: 13, color: "#0f172a", outline: "none",
                width: "100%", boxSizing: "border-box",
              }}
            />
          </div>

          {/* Batas Alpa */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>
              Batas Alpa (hari)
            </label>
            <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>
              Jumlah maksimal hari alpa sebelum siswa ditandai perlu perhatian.
            </p>
            <input
              name="batasAlpa"
              type="number"
              min={1}
              max={99}
              defaultValue={konfigurasi.batasAlpa}
              required
              style={{
                background: "rgba(255,255,255,0.6)",
                border: "0.5px solid rgba(99,102,241,0.2)",
                borderRadius: 10, padding: "10px 14px",
                fontSize: 13, color: "#0f172a", outline: "none",
                width: "100%", boxSizing: "border-box",
              }}
            />
          </div>

          {/* Zona Waktu */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>
              Zona Waktu
            </label>
            <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>
              Zona waktu yang digunakan untuk perhitungan jam lock absensi.
            </p>
            <select
              name="zonaWaktu"
              defaultValue={konfigurasi.zonaWaktu}
              required
              style={{
                background: "rgba(255,255,255,0.6)",
                border: "0.5px solid rgba(99,102,241,0.2)",
                borderRadius: 10, padding: "10px 14px",
                fontSize: 13, color: "#0f172a", outline: "none",
                width: "100%", boxSizing: "border-box", cursor: "pointer",
              }}
            >
              {zonaWaktuOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {state.message && (
            <div style={{
              padding: "10px 14px", borderRadius: 10, fontSize: 12,
              background: state.success ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
              border: `0.5px solid ${state.success ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
              color: state.success ? "#059669" : "#dc2626",
            }}>
              {state.success ? "✓ " : "✕ "}{state.message}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            style={{
              padding: "11px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600,
              background: isPending
                ? "rgba(99,102,241,0.5)"
                : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              color: "#fff", border: "none", cursor: isPending ? "not-allowed" : "pointer",
              boxShadow: "0 4px 16px rgba(99,102,241,0.3)", transition: "all 0.2s",
            }}
          >
            {isPending ? "Menyimpan..." : "Simpan Konfigurasi"}
          </button>
        </form>
      </div>
    </div>
  );
}

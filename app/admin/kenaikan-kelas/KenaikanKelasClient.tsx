"use client";

import { useState, useActionState, useEffect } from "react";
import { naikkanKelasAction } from "./actions";

type Kelas = { id: string; nama: string; jumlahSiswa: number };

const initialState = { success: false, message: "", count: 0 };

export default function KenaikanKelasClient({ kelasList }: { kelasList: Kelas[] }) {
  const [state, formAction, pending] = useActionState(naikkanKelasAction, initialState);
  const [kelasAsalId, setKelasAsalId] = useState("");
  const [kelasTujuanId, setKelasTujuanId] = useState("");
  const [konfirmasi, setKonfirmasi] = useState(false);

  const kelasAsal = kelasList.find((k) => k.id === kelasAsalId);
  const kelasTujuan = kelasList.find((k) => k.id === kelasTujuanId);

  // Reset konfirmasi kalau ganti kelas
  useEffect(() => { setKonfirmasi(false); }, [kelasAsalId, kelasTujuanId]);

  const cardStyle = {
    background: "rgba(255,255,255,0.65)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "0.5px solid rgba(255,255,255,0.9)",
    borderRadius: 20,
    boxShadow: "0 8px 32px rgba(99,102,241,0.08)",
  };

  const selectStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 10,
    border: "0.5px solid rgba(99,102,241,0.25)",
    background: "rgba(255,255,255,0.8)",
    fontSize: 13, color: "#0f172a", outline: "none",
    appearance: "none" as const, cursor: "pointer",
  };

  const labelStyle = {
    fontSize: 11, fontWeight: 700 as const, color: "#64748b",
    letterSpacing: "0.08em", textTransform: "uppercase" as const,
    marginBottom: 6, display: "block",
  };

  const siapProses = kelasAsalId && kelasTujuanId && kelasAsalId !== kelasTujuanId;

  return (
    <>
      <style>{`
        select:focus { border-color: rgba(99,102,241,0.5) !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.1) !important; }
        .submit-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 560 }}>
        {/* Header */}
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
            Kenaikan Kelas
          </h1>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
            Pindahkan seluruh siswa aktif dari satu kelas ke kelas lain.
          </p>
        </div>

        {state.success ? (
          <div style={{ ...cardStyle, padding: 32, textAlign: "center" }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>🎉</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Kenaikan Kelas Berhasil!</p>
            <p style={{ fontSize: 13, color: "#64748b", marginTop: 8, marginBottom: 24 }}>
              {state.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "10px 24px", borderRadius: 10, border: "none",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >
              Proses Lagi
            </button>
          </div>
        ) : (
          <>
            {/* Form pilih kelas */}
            <div style={{ ...cardStyle, padding: 28 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "end" }}>
                {/* Kelas asal */}
                <div>
                  <label style={labelStyle}>Kelas Asal</label>
                  <div style={{ position: "relative" }}>
                    <select value={kelasAsalId} onChange={(e) => setKelasAsalId(e.target.value)} style={selectStyle}>
                      <option value="">-- Pilih kelas --</option>
                      {kelasList.map((k) => (
                        <option key={k.id} value={k.id} disabled={k.id === kelasTujuanId}>
                          {k.nama} ({k.jumlahSiswa} siswa)
                        </option>
                      ))}
                    </select>
                    <svg style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                      viewBox="0 0 20 20" fill="#94a3b8" width={14} height={14}>
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                {/* Panah */}
                <div style={{ paddingBottom: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: siapProses ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "rgba(148,163,184,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.3s",
                  }}>
                    <svg viewBox="0 0 20 20" fill={siapProses ? "#fff" : "#94a3b8"} width={16} height={16}>
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                {/* Kelas tujuan */}
                <div>
                  <label style={labelStyle}>Kelas Tujuan</label>
                  <div style={{ position: "relative" }}>
                    <select value={kelasTujuanId} onChange={(e) => setKelasTujuanId(e.target.value)} style={selectStyle}>
                      <option value="">-- Pilih kelas --</option>
                      {kelasList.map((k) => (
                        <option key={k.id} value={k.id} disabled={k.id === kelasAsalId}>
                          {k.nama} ({k.jumlahSiswa} siswa)
                        </option>
                      ))}
                    </select>
                    <svg style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                      viewBox="0 0 20 20" fill="#94a3b8" width={14} height={14}>
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Preview info */}
              {siapProses && kelasAsal && kelasTujuan && (
                <div style={{
                  marginTop: 20, padding: "14px 16px", borderRadius: 12,
                  background: "rgba(99,102,241,0.06)",
                  border: "0.5px solid rgba(99,102,241,0.15)",
                }}>
                  <p style={{ fontSize: 13, color: "#475569" }}>
                    <strong>{kelasAsal.jumlahSiswa} siswa</strong> dari kelas{" "}
                    <strong style={{ color: "#6366f1" }}>{kelasAsal.nama}</strong> akan dipindahkan ke kelas{" "}
                    <strong style={{ color: "#6366f1" }}>{kelasTujuan.nama}</strong>.
                  </p>
                  {kelasTujuan.jumlahSiswa > 0 && (
                    <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                      ⚠️ Kelas tujuan sudah memiliki {kelasTujuan.jumlahSiswa} siswa. Nomor absen akan dilanjutkan.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Warning + konfirmasi */}
            {siapProses && (
              <div style={{
                ...cardStyle,
                padding: 20,
                background: "rgba(239,68,68,0.04)",
                border: "0.5px solid rgba(239,68,68,0.15)",
              }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
                  <svg viewBox="0 0 20 20" fill="#dc2626" width={18} height={18} style={{ flexShrink: 0, marginTop: 1 }}>
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#dc2626" }}>Perhatian</p>
                    <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                      Proses ini tidak bisa dibatalkan. Semua siswa aktif di kelas asal akan dipindahkan dan riwayat kelas lama akan ditutup.
                    </p>
                  </div>
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={konfirmasi}
                    onChange={(e) => setKonfirmasi(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: "#6366f1", cursor: "pointer" }}
                  />
                  <span style={{ fontSize: 13, color: "#475569" }}>
                    Saya mengerti dan ingin melanjutkan proses kenaikan kelas
                  </span>
                </label>
              </div>
            )}

            {/* Error message */}
            {state.message && !state.success && (
              <div style={{
                padding: "12px 16px", borderRadius: 12,
                background: "rgba(239,68,68,0.08)", border: "0.5px solid rgba(239,68,68,0.2)",
                fontSize: 13, color: "#dc2626",
              }}>
                {state.message}
              </div>
            )}

            {/* Submit */}
            <form action={formAction}>
              <input type="hidden" name="kelasAsalId" value={kelasAsalId} />
              <input type="hidden" name="kelasTujuanId" value={kelasTujuanId} />
              <button
                type="submit"
                disabled={!siapProses || !konfirmasi || pending}
                className="submit-btn"
                style={{
                  width: "100%", padding: "13px 0", borderRadius: 12, border: "none",
                  background: siapProses && konfirmasi
                    ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                    : "rgba(148,163,184,0.2)",
                  color: siapProses && konfirmasi ? "#fff" : "#94a3b8",
                  fontSize: 14, fontWeight: 700,
                  cursor: !siapProses || !konfirmasi || pending ? "not-allowed" : "pointer",
                  boxShadow: siapProses && konfirmasi ? "0 4px 16px rgba(99,102,241,0.3)" : "none",
                  transition: "all 0.2s",
                }}
              >
                {pending ? "Memproses..." : "Proses Kenaikan Kelas"}
              </button>
            </form>
          </>
        )}
      </div>
    </>
  );
}

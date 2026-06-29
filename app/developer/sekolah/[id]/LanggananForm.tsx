"use client";

import { useState, useActionState } from "react";
import { kelolaLanggananAction } from "./actions";

type Langganan = {
  paket: string;
  status: string;
  maxKelas: number;
  tanggalMulai: Date;
  tanggalBerakhir: Date;
  catatanAdmin: string | null;
};

const initialState = { success: false, message: "" };

const PAKET_OPTIONS = [
  { value: "STARTER", label: "Starter", maxKelas: 6 },
  { value: "BASIC", label: "Basic", maxKelas: 12 },
  { value: "PRO", label: "Pro", maxKelas: 24 },
  { value: "ENTERPRISE", label: "Enterprise", maxKelas: 9999 },
];

const STATUS_OPTIONS = [
  { value: "AKTIF", label: "Aktif", color: "#059669" },
  { value: "NONAKTIF", label: "Nonaktif", color: "#94a3b8" },
  { value: "EXPIRED", label: "Expired", color: "#dc2626" },
];

function toDateInput(date: Date) {
  return new Date(date).toISOString().slice(0, 10);
}

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

export default function LanggananForm({
  sekolahId,
  langganan,
}: {
  sekolahId: string;
  langganan: Langganan | null;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(kelolaLanggananAction, initialState);
  const [paket, setPaket] = useState(langganan?.paket ?? "STARTER");
  const [status, setStatus] = useState(langganan?.status ?? "AKTIF");
  const [mulai, setMulai] = useState(langganan ? toDateInput(langganan.tanggalMulai) : toDateInput(new Date()));
  const [berakhir, setBerakhir] = useState(langganan ? toDateInput(langganan.tanggalBerakhir) : addMonths(new Date(), 1));
  const [maxKelas, setMaxKelas] = useState(langganan?.maxKelas ?? 6);

  const handlePaketChange = (val: string) => {
    setPaket(val);
    const opt = PAKET_OPTIONS.find((p) => p.value === val);
    if (opt) setMaxKelas(opt.maxKelas);
  };

  const handleClose = () => setOpen(false);

  const labelStyle = {
    fontSize: 10, fontWeight: 700 as const, color: "#64748b",
    letterSpacing: "0.08em", textTransform: "uppercase" as const,
    marginBottom: 6, display: "block",
  };

  const inputStyle = {
    width: "100%", padding: "9px 12px", borderRadius: 10,
    border: "0.5px solid rgba(99,102,241,0.25)",
    background: "rgba(255,255,255,0.8)",
    fontSize: 13, color: "#0f172a", outline: "none",
    boxSizing: "border-box" as const, appearance: "none" as const,
  };

  return (
    <>
      <style>{`
        .ll-paket-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        .ll-tanggal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 480px) {
          .ll-paket-grid { grid-template-columns: repeat(2, 1fr); }
          .ll-tanggal-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      <button
        style={{
          padding: "9px 18px", borderRadius: 12, fontSize: 13, fontWeight: 600,
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          color: "#fff", border: "none", cursor: "pointer",
          boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
          transition: "all 0.2s",
        }}
      >
        Kelola Langganan
      </button>

      {open && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
          }}
          onClick={handleClose}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.97)", backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)", border: "0.5px solid rgba(255,255,255,0.9)",
              borderRadius: 20, boxShadow: "0 24px 64px rgba(0,0,0,0.15)",
              padding: 28, width: "100%", maxWidth: 520,
              maxHeight: "90vh", overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>Kelola Langganan</h2>
              <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                {langganan ? "Update langganan sekolah ini." : "Buat langganan baru untuk sekolah ini."}
              </p>
            </div>

            {state.success ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{
                  padding: "12px 16px", borderRadius: 10,
                  background: "rgba(34,197,94,0.08)", border: "0.5px solid rgba(34,197,94,0.2)",
                  fontSize: 13, color: "#16a34a",
                }}>
                  {state.message}
                </div>
                <button
                  onClick={handleClose}
                  style={{
                    padding: "10px 0", borderRadius: 10, border: "none",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  Tutup
                </button>
              </div>
            ) : (
              <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <input type="hidden" name="sekolahId" value={sekolahId} />
                <input type="hidden" name="maxKelas" value={maxKelas} />

                {/* Paket */}
                <div>
                  <label style={labelStyle}>Paket</label>
                  <div className="ll-paket-grid">
                    {PAKET_OPTIONS.map((p) => (
                      <label key={p.value} style={{ cursor: "pointer" }}>
                        <input
                          type="radio" name="paket" value={p.value}
                          checked={paket === p.value}
                          onChange={() => handlePaketChange(p.value)}
                          style={{ display: "none" }}
                        />
                        <div style={{
                          padding: "8px 0", borderRadius: 10, textAlign: "center",
                          border: `0.5px solid ${paket === p.value ? "rgba(99,102,241,0.4)" : "rgba(99,102,241,0.15)"}`,
                          background: paket === p.value ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.7)",
                          fontSize: 12, fontWeight: 600,
                          color: paket === p.value ? "#6366f1" : "#475569",
                          transition: "all 0.2s",
                        }}>
                          {p.label}
                        </div>
                      </label>
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>
                    Maks. kelas: {maxKelas === 9999 ? "Unlimited" : `${maxKelas} kelas`}
                  </p>
                </div>

                {/* Status */}
                <div>
                  <label style={labelStyle}>Status</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {STATUS_OPTIONS.map((s) => (
                      <label key={s.value} style={{ flex: 1, cursor: "pointer" }}>
                        <input
                          type="radio" name="status" value={s.value}
                          checked={status === s.value}
                          onChange={() => setStatus(s.value)}
                          style={{ display: "none" }}
                        />
                        <div style={{
                          padding: "8px 0", borderRadius: 10, textAlign: "center",
                          border: `0.5px solid ${status === s.value ? s.color + "66" : "rgba(0,0,0,0.1)"}`,
                          background: status === s.value ? s.color + "18" : "rgba(255,255,255,0.7)",
                          fontSize: 12, fontWeight: 600,
                          color: status === s.value ? s.color : "#475569",
                          transition: "all 0.2s",
                        }}>
                          {s.label}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Tanggal */}
                <div className="ll-tanggal-grid">
                  <div>
                    <label style={labelStyle}>Tanggal Mulai</label>
                    <input
                      type="date" name="tanggalMulai" value={mulai}
                      onChange={(e) => setMulai(e.target.value)}
                      required style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Tanggal Berakhir</label>
                    <input
                      type="date" name="tanggalBerakhir" value={berakhir}
                      onChange={(e) => setBerakhir(e.target.value)}
                      required style={inputStyle}
                    />
                  </div>
                </div>

                {/* Shortcut perpanjang */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", width: "100%" }}>
                    Perpanjang dari sekarang
                  </p>
                  {[1, 3, 6, 12].map((m) => (
                    <button
                      key={m} type="button"
                      onClick={() => {
                        const now = new Date().toISOString().slice(0, 10);
                        setMulai(now);
                        setBerakhir(addMonths(new Date(), m));
                      }}
                      style={{
                        padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                        border: "0.5px solid rgba(99,102,241,0.2)",
                        background: "rgba(99,102,241,0.06)", color: "#6366f1",
                        cursor: "pointer",
                      }}
                    >
                      +{m} bulan
                    </button>
                  ))}
                </div>

                {/* Catatan */}
                <div>
                  <label style={labelStyle}>Catatan Admin (opsional)</label>
                  <textarea
                    name="catatanAdmin"
                    defaultValue={langganan?.catatanAdmin ?? ""}
                    rows={2}
                    placeholder="Misal: perpanjang manual request via WA"
                    style={{ ...inputStyle, resize: "vertical" as const, fontFamily: "inherit" }}
                  />
                </div>

                {state.message && !state.success && (
                  <div style={{
                    padding: "10px 14px", borderRadius: 10,
                    background: "rgba(239,68,68,0.08)", border: "0.5px solid rgba(239,68,68,0.2)",
                    fontSize: 13, color: "#dc2626",
                  }}>
                    {state.message}
                  </div>
                )}

                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <button
                    type="button" onClick={handleClose}
                    style={{
                      flex: 1, padding: "11px 0", borderRadius: 10,
                      border: "0.5px solid rgba(0,0,0,0.1)",
                      background: "rgba(255,255,255,0.8)",
                      fontSize: 13, fontWeight: 500, color: "#475569", cursor: "pointer",
                    }}
                  >
                    Batal
                  </button>
                  <button
                    type="submit" disabled={pending}
                    style={{
                      flex: 2, padding: "11px 0", borderRadius: 10, border: "none",
                      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      color: "#fff", fontSize: 13, fontWeight: 700,
                      cursor: pending ? "not-allowed" : "pointer",
                      opacity: pending ? 0.7 : 1,
                      boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
                      transition: "all 0.2s",
                    }}
                  >
                    {pending ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

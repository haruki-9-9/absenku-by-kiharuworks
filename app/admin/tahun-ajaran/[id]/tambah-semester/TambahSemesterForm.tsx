"use client";

import { useActionState } from "react";
import { tambahSemesterAction } from "../../actions";

type State = { success: boolean; message: string };
const initialState: State = { success: false, message: "" };

export default function TambahSemesterForm({ tahunAjaranId, namaTahunAjaran }: {
  tahunAjaranId: string;
  namaTahunAjaran: string;
}) {
  const boundAction = tambahSemesterAction.bind(null, tahunAjaranId);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);

  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.7)",
    border: "0.5px solid rgba(99,102,241,0.2)",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13,
    color: "#0f172a",
    outline: "none",
    boxSizing: "border-box" as const,
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  const labelStyle = {
    fontSize: 12,
    fontWeight: 600 as const,
    color: "#475569",
    marginBottom: 6,
    display: "block" as const,
  };

  return (
    <>
      <style>{`
        .ts-input:focus { border-color: rgba(99,102,241,0.5) !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.08) !important; }
        .ts-submit:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .ts-cancel:hover { background: rgba(0,0,0,0.06) !important; }
        .ts-tanggal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .ts-actions { display: flex; gap: 12px; }
        @media (max-width: 640px) {
          .ts-tanggal-grid { grid-template-columns: 1fr; }
          .ts-actions { flex-direction: column; }
          .ts-actions a, .ts-actions button { width: 100%; text-align: center; justify-content: center; }
        }
      `}</style>

      <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Error / success */}
        {state.message && (
          <div style={{
            padding: "10px 16px", borderRadius: 10, fontSize: 12, fontWeight: 500,
            background: state.success ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
            border: `0.5px solid ${state.success ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
            color: state.success ? "#16a34a" : "#dc2626",
          }}>
            {state.message}
          </div>
        )}

        {/* Nama semester */}
        <div>
          <label htmlFor="nama" style={labelStyle}>Nama Semester</label>
          <input
            id="nama"
            name="nama"
            type="text"
            placeholder="Contoh: Semester 1, Semester Ganjil"
            required
            className="ts-input"
            style={inputStyle}
          />
        </div>

        {/* Tanggal mulai & selesai */}
        <div className="ts-tanggal-grid">
          <div>
            <label htmlFor="tanggalMulai" style={labelStyle}>Tanggal Mulai</label>
            <input
              id="tanggalMulai"
              name="tanggalMulai"
              type="date"
              required
              className="ts-input"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="tanggalSelesai" style={labelStyle}>Tanggal Selesai</label>
            <input
              id="tanggalSelesai"
              name="tanggalSelesai"
              type="date"
              required
              className="ts-input"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="ts-actions" style={{ marginTop: 4 }}>
          <button
            type="submit"
            disabled={isPending}
            className="ts-submit"
            style={{
              flex: 1,
              padding: "11px 24px", borderRadius: 12,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff", border: "none", fontSize: 13, fontWeight: 700,
              cursor: isPending ? "not-allowed" : "pointer",
              opacity: isPending ? 0.7 : 1,
              transition: "all 0.2s",
              boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
            }}
          >
            {isPending ? "Menyimpan..." : "Simpan Semester"}
          </button>
          <a
            href="/admin/tahun-ajaran"
            className="ts-cancel"
            style={{
              flex: 1,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              padding: "11px 24px", borderRadius: 12,
              background: "rgba(0,0,0,0.04)",
              border: "0.5px solid rgba(0,0,0,0.08)",
              color: "#64748b", fontSize: 13, fontWeight: 600,
              textDecoration: "none", transition: "all 0.2s",
            }}
          >
            Batal
          </a>
        </div>
      </form>
    </>
  );
}

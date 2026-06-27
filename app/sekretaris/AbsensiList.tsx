"use client";

import { useState, useTransition } from "react";
import { setStatusAbsensiAction } from "./actions";

type Siswa = { id: string; nama: string; nis: string; jenisKelamin: string };
type StatusAbsensi = "H" | "S" | "I" | "A";
type AbsensiState = { status: StatusAbsensi; keterangan: string };

const STATUS_CONFIG: Record<StatusAbsensi, { label: string; color: string; bg: string }> = {
  H: { label: "H", color: "#059669", bg: "rgba(16,185,129,0.12)" },
  S: { label: "S", color: "#db2777", bg: "rgba(236,72,153,0.12)" },
  I: { label: "I", color: "#2563eb", bg: "rgba(59,130,246,0.12)" },
  A: { label: "A", color: "#dc2626", bg: "rgba(239,68,68,0.12)" },
};

export default function AbsensiList({
  siswaList,
  absensiAwal,
  terkunci,
}: {
  siswaList: Siswa[];
  absensiAwal: Record<string, AbsensiState>;
  terkunci: boolean;
}) {
  const [absensi, setAbsensi] = useState<Record<string, AbsensiState>>(absensiAwal);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");

  function handleSetStatus(siswaId: string, status: StatusAbsensi) {
    if (terkunci) return;
    setErrorMsg("");

    if (status !== "H") {
      // S/I/A: buka editor keterangan inline dulu, simpan terjadi saat klik "Simpan"
      setEditingId(siswaId);
      setAbsensi((prev) => ({
        ...prev,
        [siswaId]: { status, keterangan: prev[siswaId]?.keterangan ?? "" },
      }));
      return;
    }

    // H: langsung simpan tanpa keterangan, tanpa perlu konfirmasi tambahan
    setAbsensi((prev) => ({ ...prev, [siswaId]: { status: "H", keterangan: "" } }));
    setEditingId(null);
    startTransition(async () => {
      const res = await setStatusAbsensiAction(siswaId, "H");
      if (!res.success) setErrorMsg(res.message);
    });
  }

  function handleKeteranganChange(siswaId: string, keterangan: string) {
    setAbsensi((prev) => ({ ...prev, [siswaId]: { ...prev[siswaId], keterangan } }));
  }

  function handleSimpanKeterangan(siswaId: string) {
    const current = absensi[siswaId];
    setErrorMsg("");
    startTransition(async () => {
      const res = await setStatusAbsensiAction(siswaId, current.status, current.keterangan);
      if (!res.success) setErrorMsg(res.message);
      else setEditingId(null);
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {errorMsg && (
        <div style={{
          padding: "10px 14px", borderRadius: 10, fontSize: 12,
          background: "rgba(239,68,68,0.08)", border: "0.5px solid rgba(239,68,68,0.2)",
          color: "#dc2626",
        }}>
          {errorMsg}
        </div>
      )}

      <div style={{
        background: "rgba(255,255,255,0.65)", backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)", border: "0.5px solid rgba(255,255,255,0.9)",
        borderRadius: 20, overflow: "hidden",
      }}>
        {siswaList.map((siswa, idx) => {
          const state = absensi[siswa.id] ?? { status: "H" as StatusAbsensi, keterangan: "" };
          const isEditing = editingId === siswa.id;

          return (
            <div
              key={siswa.id}
              style={{
                borderBottom: idx === siswaList.length - 1 ? "none" : "0.5px solid rgba(0,0,0,0.04)",
                padding: "14px 20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 28, height: 28, borderRadius: 8, fontSize: 11, fontWeight: 700,
                    flexShrink: 0,
                    background: siswa.jenisKelamin === "L" ? "rgba(14,165,233,0.1)" : "rgba(236,72,153,0.1)",
                    color: siswa.jenisKelamin === "L" ? "#0ea5e9" : "#ec4899",
                  }}>
                    {idx + 1}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{siswa.nama}</p>
                    <p style={{ fontSize: 11, fontFamily: "monospace", color: "#94a3b8" }}>{siswa.nis}</p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  {(Object.keys(STATUS_CONFIG) as StatusAbsensi[]).map((s) => {
                    const cfg = STATUS_CONFIG[s];
                    const isActive = state.status === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={terkunci || isPending}
                        onClick={() => handleSetStatus(siswa.id, s)}
                        style={{
                          width: 34, height: 34, borderRadius: 10,
                          fontSize: 13, fontWeight: 700,
                          border: isActive ? "none" : "0.5px solid rgba(0,0,0,0.1)",
                          background: isActive ? cfg.bg : "rgba(255,255,255,0.6)",
                          color: isActive ? cfg.color : "#94a3b8",
                          cursor: terkunci || isPending ? "not-allowed" : "pointer",
                          opacity: terkunci ? 0.5 : 1,
                          transition: "all 0.15s",
                        }}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {isEditing && !terkunci && (
                <div style={{ display: "flex", gap: 8, marginTop: 10, paddingLeft: 40 }}>
                  <input
                    type="text"
                    placeholder="Keterangan (opsional)"
                    value={state.keterangan}
                    onChange={(e) => handleKeteranganChange(siswa.id, e.target.value)}
                    style={{
                      flex: 1,
                      background: "rgba(255,255,255,0.7)",
                      border: "0.5px solid rgba(99,102,241,0.2)",
                      borderRadius: 8, padding: "7px 12px",
                      fontSize: 12, color: "#0f172a", outline: "none",
                    }}
                  />
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleSimpanKeterangan(siswa.id)}
                    style={{
                      padding: "7px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                      background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                      color: "#fff", border: "none",
                      cursor: isPending ? "not-allowed" : "pointer",
                    }}
                  >
                    {isPending ? "..." : "Simpan"}
                  </button>
                </div>
              )}

              {!isEditing && state.status !== "H" && state.keterangan && (
                <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 6, paddingLeft: 40, fontStyle: "italic" }}>
                  {state.keterangan}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useActionState, useState } from "react";
import { gantiPasswordAction } from "@/app/actions/ganti-password-action";

const initialState = { success: false, message: "" };

export default function GantiPasswordForm() {
  const [state, formAction, pending] = useActionState(gantiPasswordAction, initialState);
  const [show, setShow] = useState({ lama: false, baru: false, konfirmasi: false });

  const cardStyle = {
    background: "rgba(255,255,255,0.65)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    border: "0.5px solid rgba(255,255,255,0.9)",
    borderRadius: 20,
    boxShadow: "0 8px 32px rgba(99,102,241,0.08)",
    padding: 28,
    maxWidth: 460,
  };

  const inputWrapStyle = {
    position: "relative" as const,
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 40px 10px 14px",
    borderRadius: 10,
    border: "0.5px solid rgba(99,102,241,0.25)",
    background: "rgba(255,255,255,0.8)",
    fontSize: 13,
    color: "#0f172a",
    outline: "none",
    boxSizing: "border-box" as const,
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  const labelStyle = {
    fontSize: 11,
    fontWeight: 700 as const,
    color: "#64748b",
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    marginBottom: 6,
    display: "block",
  };

  const eyeStyle = {
    position: "absolute" as const,
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#94a3b8",
    display: "flex",
    padding: 0,
  };

  const fields = [
    { key: "lama" as const, name: "passwordLama", label: "Password Lama" },
    { key: "baru" as const, name: "passwordBaru", label: "Password Baru" },
    { key: "konfirmasi" as const, name: "konfirmasi", label: "Konfirmasi Password Baru" },
  ];

  return (
    <>
      <style>{`
        input:focus { border-color: rgba(99,102,241,0.5) !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.1) !important; }
        .submit-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
            Ganti Password
          </h1>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
            Pastikan password baru minimal 8 karakter.
          </p>
        </div>

        <div style={cardStyle}>
          <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {fields.map((f) => (
              <div key={f.key}>
                <label style={labelStyle}>{f.label}</label>
                <div style={inputWrapStyle}>
                  <input
                    type={show[f.key] ? "text" : "password"}
                    name={f.name}
                    required
                    style={inputStyle}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    style={eyeStyle}
                    onClick={() => setShow((s) => ({ ...s, [f.key]: !s[f.key] }))}
                  >
                    {show[f.key] ? (
                      <svg viewBox="0 0 20 20" fill="currentColor" width={15} height={15}>
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 20 20" fill="currentColor" width={15} height={15}>
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ))}

            {state.message && (
              <div style={{
                padding: "10px 14px", borderRadius: 10,
                background: state.success ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                border: `0.5px solid ${state.success ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
                fontSize: 13,
                color: state.success ? "#16a34a" : "#dc2626",
              }}>
                {state.message}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="submit-btn"
              style={{
                width: "100%", padding: "12px 0", borderRadius: 12, border: "none",
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                color: "#fff", fontSize: 14, fontWeight: 700,
                cursor: pending ? "not-allowed" : "pointer",
                opacity: pending ? 0.7 : 1,
                boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
                transition: "all 0.2s",
              }}
            >
              {pending ? "Menyimpan..." : "Simpan Password"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

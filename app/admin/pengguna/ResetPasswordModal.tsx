"use client";

import { useState, useActionState } from "react";
import { resetPasswordAction } from "./actions";

const initialState = { success: false, message: "" };

export default function ResetPasswordModal({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);

  const handleClose = () => {
    setOpen(false);
    setShow(false);
  };

  return (
    <>
      <button
        className="btn-reset"
        onClick={() => setOpen(true)}
        style={{
          padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500,
          border: "0.5px solid rgba(245,158,11,0.3)",
          background: "rgba(245,158,11,0.06)",
          color: "#b45309", cursor: "pointer", transition: "all 0.2s",
        }}
      >
        Reset Password
      </button>

      {open && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.3)",
            backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
          }}
          onClick={handleClose}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "0.5px solid rgba(255,255,255,0.9)",
              borderRadius: 20,
              boxShadow: "0 24px 64px rgba(0,0,0,0.15)",
              padding: 28,
              width: "100%",
              maxWidth: 400,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
                Reset Password
              </h2>
              <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                Set password baru untuk <strong>{userName}</strong>.
              </p>
            </div>

            {state.success ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{
                  padding: "12px 16px", borderRadius: 10,
                  background: "rgba(34,197,94,0.08)",
                  border: "0.5px solid rgba(34,197,94,0.2)",
                  fontSize: 13, color: "#16a34a",
                }}>
                  {state.message}
                </div>
                <button
                  onClick={handleClose}
                  style={{
                    padding: "10px 0", borderRadius: 10, border: "none",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: "#fff", fontSize: 13, fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Tutup
                </button>
              </div>
            ) : (
              <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <input type="hidden" name="userId" value={userId} />

                <div>
                  <label style={{
                    fontSize: 11, fontWeight: 700, color: "#64748b",
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    marginBottom: 6, display: "block",
                  }}>
                    Password Baru
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={show ? "text" : "password"}
                      name="passwordBaru"
                      required
                      minLength={8}
                      placeholder="Min. 8 karakter"
                      style={{
                        width: "100%", padding: "10px 40px 10px 14px",
                        borderRadius: 10, border: "0.5px solid rgba(99,102,241,0.25)",
                        background: "rgba(255,255,255,0.8)",
                        fontSize: 13, color: "#0f172a", outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShow((s) => !s)}
                      style={{
                        position: "absolute", right: 12, top: "50%",
                        transform: "translateY(-50%)",
                        background: "none", border: "none",
                        cursor: "pointer", color: "#94a3b8",
                        display: "flex", padding: 0,
                      }}
                    >
                      {show ? (
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

                {state.message && !state.success && (
                  <div style={{
                    padding: "10px 14px", borderRadius: 10,
                    background: "rgba(239,68,68,0.08)",
                    border: "0.5px solid rgba(239,68,68,0.2)",
                    fontSize: 13, color: "#dc2626",
                  }}>
                    {state.message}
                  </div>
                )}

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={handleClose}
                    style={{
                      flex: 1, padding: "10px 0", borderRadius: 10,
                      border: "0.5px solid rgba(0,0,0,0.1)",
                      background: "rgba(255,255,255,0.8)",
                      fontSize: 13, fontWeight: 500, color: "#475569",
                      cursor: "pointer",
                    }}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={pending}
                    style={{
                      flex: 1, padding: "10px 0", borderRadius: 10, border: "none",
                      background: "linear-gradient(135deg, #f59e0b, #f97316)",
                      color: "#fff", fontSize: 13, fontWeight: 700,
                      cursor: pending ? "not-allowed" : "pointer",
                      opacity: pending ? 0.7 : 1,
                      boxShadow: "0 4px 14px rgba(245,158,11,0.3)",
                      transition: "all 0.2s",
                    }}
                  >
                    {pending ? "Menyimpan..." : "Reset"}
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

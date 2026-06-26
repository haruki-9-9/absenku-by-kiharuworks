"use client";

import { useActionState, useState } from "react";
import { loginAction, type LoginActionState } from "@/app/login/actions";

const initialState: LoginActionState = { success: false, message: "" };

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {state.message && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 8,
          padding: "10px 14px", borderRadius: 10, fontSize: 12,
          background: "rgba(239,68,68,0.08)",
          border: "0.5px solid rgba(239,68,68,0.2)",
          color: "#dc2626",
        }}>
          <span style={{ marginTop: 1, flexShrink: 0 }}>⚠️</span>
          <span>{state.message}</span>
        </div>
      )}

      {/* Email */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="admin@sekolah.sch.id"
          style={{
            background: "rgba(255,255,255,0.6)",
            border: "0.5px solid rgba(99,102,241,0.2)",
            borderRadius: 10, padding: "10px 14px",
            fontSize: 13, color: "#0f172a", outline: "none",
            width: "100%", boxSizing: "border-box",
          }}
        />
      </div>

      {/* Password */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Password
        </label>
        <div style={{ position: "relative" }}>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            style={{
              background: "rgba(255,255,255,0.6)",
              border: "0.5px solid rgba(99,102,241,0.2)",
              borderRadius: 10, padding: "10px 40px 10px 14px",
              fontSize: 13, color: "#0f172a", outline: "none",
              width: "100%", boxSizing: "border-box",
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
            style={{
              position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer",
              color: "#94a3b8", display: "flex", padding: 0,
            }}
          >
            {showPassword ? (
              <svg viewBox="0 0 20 20" fill="currentColor" width={16} height={16}>
                <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" fill="currentColor" width={16} height={16}>
                <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z" clipRule="evenodd" />
                <path d="M10.748 13.93l2.523 2.523a10.003 10.003 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={pending}
        style={{
          marginTop: 4,
          padding: "11px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600,
          background: pending
            ? "rgba(99,102,241,0.5)"
            : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          color: "#fff", border: "none",
          cursor: pending ? "not-allowed" : "pointer",
          boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
          transition: "all 0.2s",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
      >
        {pending ? (
          <>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={{ animation: "spin 1s linear infinite" }}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" style={{ opacity: 0.75 }} />
            </svg>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            Memproses...
          </>
        ) : (
          "Masuk ke Dashboard →"
        )}
      </button>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { tambahPenggunaAction } from "../actions";
import Link from "next/link";
import { useState } from "react";

const initialState = { success: false, message: "" };

type Kelas = { id: string; nama: string };

export default function TambahPenggunaForm({ kelasList }: { kelasList: Kelas[] }) {
  const [state, formAction, isPending] = useActionState(tambahPenggunaAction, initialState);
  const [role, setRole] = useState("");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 480 }}>
      <div>
        <Link
          href="/admin/pengguna"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 12, color: "#94a3b8", textDecoration: "none", marginBottom: 16,
          }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" width={14} height={14}>
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Kembali ke Daftar Pengguna
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
          Tambah Pengguna
        </h1>
        <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
          Tambah Petugas Absensi atau Wali Kelas.
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
            <label style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>
              Nama Lengkap <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              name="nama"
              type="text"
              placeholder="Nama lengkap pengguna"
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

          {/* Email */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>
              Email <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              name="email"
              type="email"
              placeholder="email@sekolah.com"
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

          {/* Password */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>
              Password <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              name="password"
              type="password"
              placeholder="Minimal 8 karakter"
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

          {/* Role */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>
              Role <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <select
              name="role"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.6)",
                border: "0.5px solid rgba(99,102,241,0.2)",
                borderRadius: 10, padding: "10px 14px",
                fontSize: 13, color: "#0f172a", outline: "none",
                width: "100%", boxSizing: "border-box", cursor: "pointer",
              }}
            >
              <option value="">Pilih role</option>
              <option value="SEKRETARIS">Petugas Absensi</option>
              <option value="WALI_KELAS">Wali Kelas</option>
            </select>
          </div>

          {/* Kelas — hanya muncul kalau role SEKRETARIS */}
          {(role === "SEKRETARIS" || role === "WALI_KELAS") && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>
                Tugaskan ke Kelas <span style={{ color: "#ef4444" }}>*</span>
              </label>
              {kelasList.length === 0 ? (
                <div style={{
                  padding: "10px 14px", borderRadius: 10, fontSize: 12,
                  background: "rgba(245,158,11,0.08)",
                  border: "0.5px solid rgba(245,158,11,0.2)",
                  color: "#b45309",
                }}>
                  Belum ada kelas aktif. Tambah kelas terlebih dahulu.
                </div>
              ) : (
                <select
                  name="kelasId"
                  required
                  style={{
                    background: "rgba(255,255,255,0.6)",
                    border: "0.5px solid rgba(99,102,241,0.2)",
                    borderRadius: 10, padding: "10px 14px",
                    fontSize: 13, color: "#0f172a", outline: "none",
                    width: "100%", boxSizing: "border-box", cursor: "pointer",
                  }}
                >
                  <option value="">Pilih kelas</option>
                  {kelasList.map((kelas) => (
                    <option key={kelas.id} value={kelas.id}>
                      {kelas.nama}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

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
            {isPending ? "Menyimpan..." : "Tambah Pengguna"}
          </button>
        </form>
      </div>
    </div>
  );
}

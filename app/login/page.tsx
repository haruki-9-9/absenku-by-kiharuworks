import LoginForm from "@/components/auth/login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        overflow: "hidden",
        position: "relative",
        background: "linear-gradient(135deg, #e0e7ff 0%, #f0e6ff 30%, #fce7f3 60%, #e0f2fe 100%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Blob */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{
          position: "absolute", width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
          top: -100, left: -100,
        }} />
        <div style={{
          position: "absolute", width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)",
          bottom: -50, right: -50,
        }} />
      </div>

      {/* Top bar */}
      <div style={{
        position: "relative", zIndex: 10,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 32px",
      }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
          absenku{" "}
          <span style={{ fontSize: 12, fontWeight: 400, color: "#94a3b8" }}>by KiharuWorks</span>
        </span>
        <Link
          href="/"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 12, fontWeight: 500, color: "#64748b", textDecoration: "none",
            padding: "7px 14px", borderRadius: 10,
            background: "rgba(255,255,255,0.6)",
            border: "0.5px solid rgba(255,255,255,0.9)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            transition: "all 0.2s",
          }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" width={14} height={14}>
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Kembali ke Beranda
        </Link>
      </div>

      {/* Card */}
      <div style={{
        position: "relative", zIndex: 10,
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "0 24px 48px",
      }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <div style={{
            background: "rgba(255,255,255,0.65)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "0.5px solid rgba(255,255,255,0.9)",
            borderRadius: 24,
            padding: "32px",
            boxShadow: "0 8px 32px rgba(99,102,241,0.10)",
          }}>
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14, marginBottom: 16,
                background: "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.12) 100%)",
                border: "0.5px solid rgba(99,102,241,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#6366f1",
              }}>
                <svg viewBox="0 0 20 20" fill="currentColor" width={20} height={20}>
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#6366f1", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>
                absenku · by KiharuWorks
              </p>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px", marginBottom: 4 }}>
                Login
              </h1>
              <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
                Masuk untuk mengakses sistem absensi sekolah.
              </p>
            </div>

            <LoginForm />
          </div>

          <p style={{ marginTop: 16, textAlign: "center", fontSize: 11, color: "#94a3b8" }}>
            Hubungi admin sekolah jika tidak bisa masuk.
          </p>
        </div>
      </div>
    </div>
  );
}

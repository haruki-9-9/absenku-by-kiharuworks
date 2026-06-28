"use client";

export default function DashboardError({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 400,
        padding: 24,
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.65)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "0.5px solid rgba(255,255,255,0.9)",
          borderRadius: 20,
          padding: "40px 32px",
          maxWidth: 400,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(99,102,241,0.08)",
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 14 }}>😵</div>
        <h3
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#0f172a",
            marginBottom: 8,
            letterSpacing: "-0.3px",
          }}
        >
          Gagal memuat halaman
        </h3>
        <p
          style={{
            fontSize: 12,
            color: "#64748b",
            marginBottom: 24,
            lineHeight: 1.6,
          }}
        >
          Terjadi kesalahan saat mengambil data. Periksa koneksi internet kamu
          dan coba lagi.
        </p>
        <button
          onClick={reset}
          style={{
            padding: "9px 24px",
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
            transition: "opacity 0.2s",
          }}
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}

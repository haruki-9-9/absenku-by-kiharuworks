import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #e0e7ff 0%, #f0e6ff 30%, #fce7f3 60%, #e0f2fe 100%)",
        padding: 24,
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.65)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "0.5px solid rgba(255,255,255,0.9)",
          borderRadius: 24,
          padding: "48px 40px",
          maxWidth: 440,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 16px 60px rgba(99,102,241,0.1)",
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            lineHeight: 1,
            marginBottom: 16,
          }}
        >
          404
        </div>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "#0f172a",
            marginBottom: 8,
            letterSpacing: "-0.5px",
          }}
        >
          Halaman tidak ditemukan
        </h2>
        <p
          style={{
            fontSize: 13,
            color: "#64748b",
            marginBottom: 28,
            lineHeight: 1.6,
          }}
        >
          Halaman yang kamu cari tidak ada atau sudah dipindahkan.
        </p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "10px 28px",
            borderRadius: 12,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            textDecoration: "none",
            boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
          }}
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}

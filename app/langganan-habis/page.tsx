import { logoutAction } from "@/app/login/actions";

export default function LanggananHabisPage() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #e0e7ff 0%, #f0e6ff 30%, #fce7f3 60%, #e0f2fe 100%)",
      padding: 24,
    }}>
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

      <div style={{
        position: "relative", zIndex: 1,
        background: "rgba(255,255,255,0.65)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "0.5px solid rgba(255,255,255,0.9)",
        borderRadius: 24,
        boxShadow: "0 8px 32px rgba(99,102,241,0.1)",
        padding: "48px 40px",
        maxWidth: 420,
        width: "100%",
        textAlign: "center",
      }}>
        {/* Icon */}
        <div style={{
          width: 64, height: 64, borderRadius: 20, margin: "0 auto 24px",
          background: "rgba(239,68,68,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 30,
        }}>
          ⏰
        </div>

        <h1 style={{
          fontSize: 20, fontWeight: 800, color: "#0f172a",
          letterSpacing: "-0.5px", marginBottom: 8,
        }}>
          Langganan Habis
        </h1>

        <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, marginBottom: 8 }}>
          Masa langganan sekolah Anda telah berakhir. Akses ke aplikasi absenku tidak dapat dilanjutkan.
        </p>

        <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, marginBottom: 32 }}>
          Hubungi administrator atau tim KiharuWorks untuk memperpanjang langganan.
        </p>

        {/* WA CTA */}
        <a
          href="https://wa.me/6283818900667?text=Halo%2C%20saya%20ingin%20memperpanjang%20langganan%20absenku."
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block", width: "100%", padding: "12px",
            borderRadius: 12, fontSize: 13, fontWeight: 700,
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            color: "#fff", textDecoration: "none",
            boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
            marginBottom: 12,
          }}
        >
          Hubungi KiharuWorks via WhatsApp
        </a>

        {/* Logout */}
        <form action={logoutAction}>
          <button
            type="submit"
            style={{
              width: "100%", padding: "12px", borderRadius: 12,
              fontSize: 13, fontWeight: 600,
              background: "rgba(255,255,255,0.6)",
              border: "0.5px solid rgba(99,102,241,0.15)",
              color: "#64748b", cursor: "pointer",
            }}
          >
            Logout
          </button>
        </form>
      </div>
    </div>
  );
}

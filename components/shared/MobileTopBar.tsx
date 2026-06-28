"use client";

type MobileTopBarProps = {
  onMenuClick?: () => void;
};

export default function MobileTopBar({ onMenuClick }: MobileTopBarProps) {
  return (
    <>
      <style>{`
        .absenku-mobile-topbar { display: none; }
        @media (max-width: 768px) {
          .absenku-mobile-topbar { display: flex !important; }
        }
      `}</style>
      <header
        className="absenku-mobile-topbar"
        style={{
          alignItems: "center",
          justifyContent: onMenuClick ? "flex-start" : "center",
          gap: 12,
          height: 56,
          padding: "0 16px",
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "0.5px solid rgba(0,0,0,0.08)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Buka menu"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: 10,
              border: "none",
              background: "rgba(99,102,241,0.1)",
              color: "#6366f1",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width={18} height={18}>
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}

        <div style={{ textAlign: onMenuClick ? "left" : "center" }}>
          <p
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-0.4px",
              lineHeight: 1.1,
            }}
          >
            absenku
          </p>
          <p style={{ fontSize: 9, color: "#94a3b8", fontWeight: 500 }}>
            by KiharuWorks
          </p>
        </div>
      </header>
    </>
  );
}

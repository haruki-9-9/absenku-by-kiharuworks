export default function DashboardLoading() {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }
        .sk {
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0.4) 25%,
            rgba(255,255,255,0.7) 50%,
            rgba(255,255,255,0.4) 75%
          );
          background-size: 600px 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 8px;
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Title skeleton */}
        <div className="sk" style={{ height: 28, width: 200 }} />

        {/* Cards skeleton */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.55)",
                backdropFilter: "blur(20px)",
                border: "0.5px solid rgba(255,255,255,0.9)",
                borderRadius: 16,
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div className="sk" style={{ height: 14, width: "60%" }} />
              <div className="sk" style={{ height: 28, width: "40%" }} />
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div
          style={{
            background: "rgba(255,255,255,0.55)",
            backdropFilter: "blur(20px)",
            border: "0.5px solid rgba(255,255,255,0.9)",
            borderRadius: 16,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div className="sk" style={{ height: 18, width: 160 }} />
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div className="sk" style={{ height: 12, flex: 2 }} />
              <div className="sk" style={{ height: 12, flex: 1 }} />
              <div className="sk" style={{ height: 12, flex: 1 }} />
              <div className="sk" style={{ height: 12, width: 60 }} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

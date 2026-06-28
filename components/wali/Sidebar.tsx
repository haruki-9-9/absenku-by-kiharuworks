"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    label: "Kehadiran Hari Ini",
    href: "/wali/kehadiran",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width={16} height={16}>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: "Rekap",
    href: "/wali/rekap",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width={16} height={16}>
        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v2a1 1 0 102 0v-2zm2-5a1 1 0 011 1v6a1 1 0 11-2 0V8a1 1 0 011-1zm4 3a1 1 0 10-2 0v3a1 1 0 102 0v-3z" clipRule="evenodd" />
      </svg>
    ),
  },

  {
    label: "Ganti Password",
    href: "/wali/ganti-password",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width={16} height={16}>
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 220,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "rgba(255,255,255,0.55)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRight: "0.5px solid rgba(255,255,255,0.9)",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "20px 20px 16px",
          borderBottom: "0.5px solid rgba(0,0,0,0.06)",
        }}
      >
        <p style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
          absenku
        </p>
        <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>
          by KiharuWorks
        </p>
      </div>

      {/* Nav */}
      <nav
        style={{
          flex: 1,
          padding: "12px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          overflowY: "auto",
        }}
      >
        <p
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: "#94a3b8",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "0 10px",
            marginBottom: 6,
          }}
        >
          Menu
        </p>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 500,
                textDecoration: "none",
                transition: "all 0.2s",
                background: isActive ? "rgba(99,102,241,0.12)" : "transparent",
                color: isActive ? "#6366f1" : "#475569",
              }}
            >
              <span style={{ color: isActive ? "#6366f1" : "#94a3b8", display: "flex" }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: "12px 10px", borderTop: "0.5px solid rgba(0,0,0,0.06)" }}>
        <div
          style={{
            background: "rgba(99,102,241,0.08)",
            borderRadius: 12,
            padding: "10px 12px",
          }}
        >
          <p style={{ fontSize: 10, fontWeight: 700, color: "#6366f1" }}>Wali Kelas</p>
          <p style={{ fontSize: 10, color: "#818cf8" }}>by KiharuWorks</p>
        </div>
      </div>
    </aside>
  );
}

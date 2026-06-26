"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    label: "Overview",
    href: "/developer",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
        <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
      </svg>
    ),
  },
  {
    label: "Sekolah",
    href: "/developer/sekolah",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path
          fillRule="evenodd"
          d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    label: "Langganan",
    href: "/developer/langganan",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path
          fillRule="evenodd"
          d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: 220, display: "flex", flexDirection: "column",
      background: "rgba(255,255,255,0.55)", backdropFilter: "blur(20px)",
      borderRight: "0.5px solid rgba(255,255,255,0.9)",
      position: "relative", zIndex: 10, flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: "20px 20px 16px", borderBottom: "0.5px solid rgba(0,0,0,0.06)" }}>
        <p style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>absenku</p>
        <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>by KiharuWorks</p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
        <p style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.12em", textTransform: "uppercase", padding: "0 10px", marginBottom: 6 }}>
          Menu
        </p>
        {navItems.map((item) => {
          const isActive =
            item.href === "/developer"
              ? pathname === "/developer"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 12, fontSize: 13, fontWeight: 500,
                textDecoration: "none", transition: "all 0.2s",
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
        <div style={{
          background: "rgba(99,102,241,0.08)", borderRadius: 12, padding: "10px 12px",
        }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#6366f1" }}>Developer</p>
          <p style={{ fontSize: 10, color: "#818cf8" }}>KiharuWorks</p>
        </div>
      </div>
    </aside>
  );
}

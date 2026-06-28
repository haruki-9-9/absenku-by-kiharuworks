"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
  exact?: boolean;
};

type SharedSidebarProps = {
  navItems: NavItem[];
  roleLabel: string;
};

export default function SharedSidebar({ navItems, roleLabel }: SharedSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .absenku-desktop-sidebar { display: none !important; }
        }
      `}</style>
      <aside
        className="absenku-desktop-sidebar"
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
        <p
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: "#0f172a",
            letterSpacing: "-0.5px",
          }}
        >
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
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

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
                background: isActive
                  ? "rgba(99,102,241,0.12)"
                  : "transparent",
                color: isActive ? "#6366f1" : "#475569",
              }}
            >
              <span
                style={{
                  color: isActive ? "#6366f1" : "#94a3b8",
                  display: "flex",
                }}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: "12px 10px",
          borderTop: "0.5px solid rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            background: "rgba(99,102,241,0.08)",
            borderRadius: 12,
            padding: "10px 12px",
          }}
        >
          <p style={{ fontSize: 10, fontWeight: 700, color: "#6366f1" }}>
            {roleLabel}
          </p>
          <p style={{ fontSize: 10, color: "#818cf8" }}>by KiharuWorks</p>
        </div>
      </div>
    </aside>
    </>
  );
}

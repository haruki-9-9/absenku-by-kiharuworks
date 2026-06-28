"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/login/actions";
import type { NavItem } from "@/components/shared/SharedSidebar";

type MobileDrawerProps = {
  navItems: NavItem[];
  roleLabel: string;
  user: { name: string; email: string };
  open: boolean;
  onClose: () => void;
};

export default function MobileDrawer({
  navItems,
  roleLabel,
  user,
  open,
  onClose,
}: MobileDrawerProps) {
  const pathname = usePathname();

  return (
    <>
      <style>{`
        .absenku-drawer-overlay,
        .absenku-drawer-panel {
          display: none;
        }
        @media (max-width: 768px) {
          .absenku-drawer-overlay { display: ${open ? "block" : "none"} !important; }
          .absenku-drawer-panel { display: flex !important; }
        }
      `}</style>

      {/* Overlay gelap di belakang drawer */}
      <div
        className="absenku-drawer-overlay"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 60,
          background: "rgba(15,23,42,0.4)",
        }}
      />

      {/* Panel drawer */}
      <aside
        className="absenku-drawer-panel"
        style={{
          position: "fixed",
          top: 0,
          left: open ? 0 : -280,
          bottom: 0,
          width: 260,
          zIndex: 61,
          flexDirection: "column",
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "4px 0 24px rgba(0,0,0,0.12)",
          transition: "left 0.25s ease",
        }}
      >
        {/* Header drawer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 18px 14px",
            borderBottom: "0.5px solid rgba(0,0,0,0.06)",
          }}
        >
          <div>
            <p style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
              absenku
            </p>
            <p style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>by KiharuWorks</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: 10,
              border: "none",
              background: "rgba(0,0,0,0.05)",
              color: "#64748b",
              cursor: "pointer",
            }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" width={16} height={16}>
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Info user */}
        <div
          style={{
            padding: "14px 18px",
            borderBottom: "0.5px solid rgba(0,0,0,0.06)",
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{user.name}</p>
          <p style={{ fontSize: 11, color: "#94a3b8" }}>{user.email}</p>
        </div>

        {/* Nav items */}
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
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "11px 12px",
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: "none",
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

        {/* Footer: role badge + logout */}
        <div
          style={{
            padding: "12px 10px",
            borderTop: "0.5px solid rgba(0,0,0,0.06)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{
              background: "rgba(99,102,241,0.08)",
              borderRadius: 12,
              padding: "10px 12px",
            }}
          >
            <p style={{ fontSize: 10, fontWeight: 700, color: "#6366f1" }}>{roleLabel}</p>
            <p style={{ fontSize: 10, color: "#818cf8" }}>by KiharuWorks</p>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 600,
                background: "rgba(239,68,68,0.08)",
                border: "0.5px solid rgba(239,68,68,0.18)",
                color: "#dc2626",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}

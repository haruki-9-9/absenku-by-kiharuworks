"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { logoutAction } from "@/app/login/actions";
import type { NavItem } from "@/components/shared/SharedSidebar";

type BottomNavProps = {
  navItems: NavItem[];
};

const LOGOUT_ICON: ReactNode = (
  <svg viewBox="0 0 20 20" fill="currentColor" width={20} height={20}>
    <path
      fillRule="evenodd"
      d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z"
      clipRule="evenodd"
    />
    <path
      fillRule="evenodd"
      d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z"
      clipRule="evenodd"
    />
  </svg>
);

export default function BottomNav({ navItems }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <>
      <style>{`
        .absenku-bottom-nav { display: none; }
        @media (max-width: 768px) {
          .absenku-bottom-nav { display: flex !important; }
        }
      `}</style>
      <nav
        className="absenku-bottom-nav"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          alignItems: "center",
          justifyContent: "space-around",
          height: 64,
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "0.5px solid rgba(0,0,0,0.08)",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.04)",
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
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                flex: 1,
                height: "100%",
                textDecoration: "none",
                color: isActive ? "#6366f1" : "#94a3b8",
              }}
            >
              <span style={{ display: "flex" }}>{item.icon}</span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: isActive ? 700 : 500,
                  textAlign: "center",
                  lineHeight: 1.1,
                  maxWidth: 64,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        <form action={logoutAction} style={{ flex: 1, height: "100%" }}>
          <button
            type="submit"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              width: "100%",
              height: "100%",
              border: "none",
              background: "transparent",
              color: "#ef4444",
              cursor: "pointer",
            }}
          >
            <span style={{ display: "flex" }}>{LOGOUT_ICON}</span>
            <span style={{ fontSize: 10, fontWeight: 500 }}>Keluar</span>
          </button>
        </form>
      </nav>
    </>
  );
}

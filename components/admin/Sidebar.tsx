"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    label: "Overview",
    href: "/admin",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width={16} height={16}>
        <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
        <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
      </svg>
    ),
  },
  {
    label: "Tahun Ajaran",
    href: "/admin/tahun-ajaran",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width={16} height={16}>
        <path
          fillRule="evenodd"
          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    label: "Kelas",
    href: "/admin/kelas",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width={16} height={16}>
        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
      </svg>
    ),
  },
  {
    label: "Siswa",
    href: "/admin/siswa",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width={16} height={16}>
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
      </svg>
    ),
  },
  {
    label: "Pengguna",
    href: "/admin/pengguna",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width={16} height={16}>
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    label: "Rekap",
    href: "/admin/rekap",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width={16} height={16}>
        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v2a1 1 0 102 0v-2zm2-5a1 1 0 011 1v6a1 1 0 11-2 0V8a1 1 0 011-1zm4 3a1 1 0 10-2 0v3a1 1 0 102 0v-3z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: "Konfigurasi",
    href: "/admin/konfigurasi",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width={16} height={16}>
        <path
          fillRule="evenodd"
          d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
          clipRule="evenodd"
        />
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
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
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
        style={{ padding: "12px 10px", borderTop: "0.5px solid rgba(0,0,0,0.06)" }}
      >
        <div
          style={{
            background: "rgba(99,102,241,0.08)",
            borderRadius: 12,
            padding: "10px 12px",
          }}
        >
          <p style={{ fontSize: 10, fontWeight: 700, color: "#6366f1" }}>
            Admin Sekolah
          </p>
          <p style={{ fontSize: 10, color: "#818cf8" }}>by KiharuWorks</p>
        </div>
      </div>
    </aside>
  );
}

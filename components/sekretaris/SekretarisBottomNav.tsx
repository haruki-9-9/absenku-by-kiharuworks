"use client";

import BottomNav from "@/components/shared/BottomNav";
import MobileTopBar from "@/components/shared/MobileTopBar";
import type { NavItem } from "@/components/shared/SharedSidebar";

const navItems: NavItem[] = [
  {
    label: "Absensi Hari Ini",
    href: "/sekretaris",
    exact: true,
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width={20} height={20}>
        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: "Ganti Password",
    href: "/sekretaris/ganti-password",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width={20} height={20}>
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
      </svg>
    ),
  },
];

export default function SekretarisBottomNav() {
  return (
    <>
      <MobileTopBar />
      <BottomNav navItems={navItems} />
    </>
  );
}

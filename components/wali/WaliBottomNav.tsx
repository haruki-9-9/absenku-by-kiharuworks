"use client";

import BottomNav from "@/components/shared/BottomNav";
import MobileTopBar from "@/components/shared/MobileTopBar";
import type { NavItem } from "@/components/shared/SharedSidebar";

const navItems: NavItem[] = [
  {
    label: "Kehadiran",
    href: "/wali/kehadiran",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width={20} height={20}>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: "Rekap",
    href: "/wali/rekap",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width={20} height={20}>
        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v2a1 1 0 102 0v-2zm2-5a1 1 0 011 1v6a1 1 0 11-2 0V8a1 1 0 011-1zm4 3a1 1 0 10-2 0v3a1 1 0 102 0v-3z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: "Ganti Password",
    href: "/wali/ganti-password",
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width={20} height={20}>
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
      </svg>
    ),
  },
];

export default function WaliBottomNav() {
  return (
    <>
      <MobileTopBar />
      <BottomNav navItems={navItems} />
    </>
  );
}

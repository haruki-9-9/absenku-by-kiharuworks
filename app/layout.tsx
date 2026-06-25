import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "absenku · by KiharuWorks",
  description: "Aplikasi absensi harian sekolah yang simpel dan efisien.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}

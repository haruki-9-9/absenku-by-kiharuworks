import { getCurrentUser } from "@/lib/auth/get-current-user";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import WaliKehadiranClient from "./WaliKehadiranClient";

export default async function WaliKehadiranPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "WALI_KELAS" || !user.sekolahId) redirect("/login");

  // Ambil kelas yang ditugaskan ke wali kelas ini
  const waliKelas = await prisma.waliKelas.findUnique({
    where: { userId: user.id },
    include: { kelas: true },
  });

  if (!waliKelas) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
          Kehadiran Hari Ini
        </h1>
        <div style={{
          background: "rgba(255,255,255,0.65)", backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)", border: "0.5px solid rgba(255,255,255,0.9)",
          borderRadius: 20, boxShadow: "0 8px 32px rgba(99,102,241,0.08)",
          padding: 48, textAlign: "center",
        }}>
          <p style={{ fontSize: 13, color: "#94a3b8" }}>
            Kamu belum ditugaskan ke kelas manapun. Hubungi Admin Sekolah.
          </p>
        </div>
      </div>
    );
  }

  return (
    <WaliKehadiranClient
      kelasId={waliKelas.kelasId}
      kelasNama={waliKelas.kelas.nama}
    />
  );
}

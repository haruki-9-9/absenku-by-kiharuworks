import { getCurrentUser } from "@/lib/auth/get-current-user";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import TambahSemesterForm from "./TambahSemesterForm";

export default async function TambahSemesterPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN_SEKOLAH" || !user.sekolahId) redirect("/login");

  const tahunAjaran = await prisma.tahunAjaran.findFirst({
    where: { id: params.id, sekolahId: user.sekolahId },
  });
  if (!tahunAjaran) notFound();

  const cardStyle = {
    background: "rgba(255,255,255,0.65)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)" as const,
    border: "0.5px solid rgba(255,255,255,0.9)",
    borderRadius: 20,
    boxShadow: "0 8px 32px rgba(99,102,241,0.08)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 560 }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#94a3b8" }}>
        <Link href="/admin/tahun-ajaran" style={{ color: "#6366f1", textDecoration: "none", fontWeight: 600 }}>
          Tahun Ajaran
        </Link>
        <span>›</span>
        <span style={{ color: "#64748b" }}>{tahunAjaran.nama}</span>
        <span>›</span>
        <span>Tambah Semester</span>
      </div>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
          Tambah Semester
        </h1>
        <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
          Menambah semester untuk tahun ajaran{" "}
          <strong style={{ color: "#6366f1" }}>{tahunAjaran.nama}</strong>.
        </p>
      </div>

      {/* Form card */}
      <div style={{ ...cardStyle, padding: "28px 32px" }}>
        <TambahSemesterForm
          tahunAjaranId={tahunAjaran.id}
          namaTahunAjaran={tahunAjaran.nama}
        />
      </div>
    </div>
  );
}

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import KehadiranClient from "./KehadiranClient";

export default async function KehadiranPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN_SEKOLAH" || !user.sekolahId) redirect("/login");

  const kelasList = await prisma.kelas.findMany({
    where: { sekolahId: user.sekolahId, isActive: true },
    orderBy: { nama: "asc" },
    select: { id: true, nama: true },
  });

  return <KehadiranClient kelasList={kelasList} />;
}

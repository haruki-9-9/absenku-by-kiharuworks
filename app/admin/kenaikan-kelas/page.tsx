import { getCurrentUser } from "@/lib/auth/get-current-user";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import KenaikanKelasClient from "./KenaikanKelasClient";

export default async function KenaikanKelasPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN_SEKOLAH" || !user.sekolahId) redirect("/login");

  const kelasList = await prisma.kelas.findMany({
    where: { sekolahId: user.sekolahId, isActive: true },
    orderBy: { nama: "asc" },
    select: {
      id: true,
      nama: true,
      _count: {
        select: {
          siswa: { where: { tanggalKeluar: null, siswa: { isActive: true } } },
        },
      },
    },
  });

  return <KenaikanKelasClient kelasList={kelasList.map((k) => ({ id: k.id, nama: k.nama, jumlahSiswa: k._count.siswa }))} />;
}

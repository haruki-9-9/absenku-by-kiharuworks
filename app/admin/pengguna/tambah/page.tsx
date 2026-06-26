import { getCurrentUser } from "@/lib/auth/get-current-user";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import TambahPenggunaForm from "./TambahPenggunaForm";

export default async function TambahPenggunaPage() {
  const user = await getCurrentUser();
  if (!user || !user.sekolahId) redirect("/login");

  // Ambil kelas aktif yang belum punya sekretaris
  const kelasList = await prisma.kelas.findMany({
    where: {
      sekolahId: user.sekolahId,
      isActive: true,
      sekretaris: null,
    },
    orderBy: { nama: "asc" },
    select: { id: true, nama: true },
  });

  return <TambahPenggunaForm kelasList={kelasList} />;
}

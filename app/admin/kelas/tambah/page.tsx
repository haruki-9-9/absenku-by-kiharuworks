import { getCurrentUser } from "@/lib/auth/get-current-user";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import TambahKelasForm from "./TambahKelasForm";

export default async function TambahKelasPage() {
  const user = await getCurrentUser();
  if (!user || !user.sekolahId) redirect("/login");

  const tahunAjaranList = await prisma.tahunAjaran.findMany({
    where: { sekolahId: user.sekolahId, isActive: true },
    orderBy: { nama: "desc" },
    select: { id: true, nama: true },
  });

  return <TambahKelasForm tahunAjaranList={tahunAjaranList} />;
}

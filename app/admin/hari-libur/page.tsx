import { getCurrentUser } from "@/lib/auth/get-current-user";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import HariLiburClient from "./HariLiburClient";

export default async function HariLiburPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN_SEKOLAH" || !user.sekolahId) redirect("/login");

  const hariLiburList = await prisma.hariLibur.findMany({
    where: { sekolahId: user.sekolahId },
    orderBy: { tanggal: "asc" },
  });

  return (
    <HariLiburClient
      hariLiburList={hariLiburList.map((h) => ({
        id: h.id,
        tanggal: h.tanggal,
        keterangan: h.keterangan,
      }))}
    />
  );
}

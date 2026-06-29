import { getCurrentUser } from "@/lib/auth/get-current-user";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ImportSiswaForm from "./ImportSiswaForm";

export default async function ImportSiswaPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN_SEKOLAH" || !user.sekolahId) redirect("/login");

  const kelasList = await prisma.kelas.findMany({
    where: { sekolahId: user.sekolahId, isActive: true },
    orderBy: { nama: "asc" },
    select: { id: true, nama: true },
  });

  return <ImportSiswaForm kelasList={kelasList} />;
}

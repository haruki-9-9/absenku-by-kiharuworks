import { getCurrentUser } from "@/lib/auth/get-current-user";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import KonfigurasiForm from "./KonfigurasiForm";

export default async function KonfigurasiPage() {
  const user = await getCurrentUser();
  if (!user || !user.sekolahId) redirect("/login");

  const konfigurasi = await prisma.konfigurasiSekolah.findUnique({
    where: { sekolahId: user.sekolahId },
  });

  if (!konfigurasi) redirect("/admin");

  return (
    <KonfigurasiForm
      konfigurasi={{
        jamLock: konfigurasi.jamLock,
        batasAlpa: konfigurasi.batasAlpa,
        zonaWaktu: konfigurasi.zonaWaktu,
      }}
    />
  );
}

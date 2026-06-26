"use server";

import { prisma } from "@/lib/prisma";

/**
 * Cek semua langganan yang sudah melewati tanggalBerakhir
 * dan update statusnya menjadi EXPIRED.
 * Dipanggil di layout developer setiap kali halaman diakses.
 */
export async function checkExpiredLangganan() {
  await prisma.langganan.updateMany({
    where: {
      status: "AKTIF",
      tanggalBerakhir: {
        lt: new Date(),
      },
    },
    data: {
      status: "EXPIRED",
    },
  });
}

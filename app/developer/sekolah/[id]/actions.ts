"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export async function kelolaLanggananAction(
  _prevState: { success: boolean; message: string },
  formData: FormData
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "DEVELOPER") {
    return { success: false, message: "Tidak terautentikasi." };
  }

  const sekolahId = String(formData.get("sekolahId") || "").trim();
  const paket = String(formData.get("paket") || "").trim();
  const status = String(formData.get("status") || "").trim();
  const maxKelas = parseInt(String(formData.get("maxKelas") || "6"));
  const tanggalMulai = String(formData.get("tanggalMulai") || "").trim();
  const tanggalBerakhir = String(formData.get("tanggalBerakhir") || "").trim();
  const catatanAdmin = String(formData.get("catatanAdmin") || "").trim();

  if (!sekolahId || !paket || !status || !tanggalMulai || !tanggalBerakhir) {
    return { success: false, message: "Semua field wajib diisi." };
  }

  const validPaket = ["STARTER", "BASIC", "PRO", "ENTERPRISE"];
  const validStatus = ["AKTIF", "NONAKTIF", "EXPIRED"];

  if (!validPaket.includes(paket)) return { success: false, message: "Paket tidak valid." };
  if (!validStatus.includes(status)) return { success: false, message: "Status tidak valid." };
  if (isNaN(maxKelas) || maxKelas < 1) return { success: false, message: "Maks. kelas tidak valid." };

  const mulai = new Date(tanggalMulai);
  const berakhir = new Date(tanggalBerakhir);

  if (berakhir <= mulai) {
    return { success: false, message: "Tanggal berakhir harus setelah tanggal mulai." };
  }

  try {
    await prisma.langganan.upsert({
      where: { sekolahId },
      create: {
        sekolahId,
        paket: paket as "STARTER" | "BASIC" | "PRO" | "ENTERPRISE",
        status: status as "AKTIF" | "NONAKTIF" | "EXPIRED",
        maxKelas,
        tanggalMulai: mulai,
        tanggalBerakhir: berakhir,
        catatanAdmin: catatanAdmin || null,
      },
      update: {
        paket: paket as "STARTER" | "BASIC" | "PRO" | "ENTERPRISE",
        status: status as "AKTIF" | "NONAKTIF" | "EXPIRED",
        maxKelas,
        tanggalMulai: mulai,
        tanggalBerakhir: berakhir,
        catatanAdmin: catatanAdmin || null,
      },
    });

    revalidatePath(`/developer/sekolah/${sekolahId}`);
    revalidatePath("/developer/sekolah");
    return { success: true, message: "Langganan berhasil diperbarui." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Terjadi kesalahan, coba lagi." };
  }
}

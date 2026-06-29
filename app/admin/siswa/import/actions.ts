"use server";

import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/get-current-user";

type ImportRowError = { baris: number; alasan: string };

type ImportResult = {
  success: boolean;
  message: string;
  totalBerhasil?: number;
  totalGagal?: number;
  errors?: ImportRowError[];
};

// Kolom: Nama Siswa, Jenis Kelamin, NIS (sesuai permintaan — tanpa Kelas)
const HEADER = ["Nama Siswa", "Jenis Kelamin (L/P)", "NIS"];

/**
 * Generate template Excel per kelas — tanpa kolom Kelas.
 * kelasId di-pass dari client (pilihan user).
 */
export async function generateTemplateAction(kelasId: string): Promise<
  { success: true; base64: string; filename: string } | { success: false; message: string }
> {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN_SEKOLAH" || !user.sekolahId) {
    return { success: false, message: "Tidak terautentikasi." };
  }

  const kelas = await prisma.kelas.findFirst({
    where: { id: kelasId, sekolahId: user.sekolahId, isActive: true },
    select: { nama: true },
  });
  if (!kelas) return { success: false, message: "Kelas tidak valid." };

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Import Siswa");

  // Header
  sheet.addRow(HEADER);
  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6366F1" } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  sheet.columns = [
    { width: 30 }, // Nama
    { width: 20 }, // Jenis Kelamin
    { width: 16 }, // NIS
  ];

  // Dropdown jenis kelamin untuk 200 baris
  const MAX_ROWS = 200;
  for (let i = 2; i <= MAX_ROWS + 1; i++) {
    sheet.getCell(`B${i}`).dataValidation = {
      type: "list",
      allowBlank: false,
      formulae: ['"L,P"'],
      showErrorMessage: true,
      errorTitle: "Jenis Kelamin tidak valid",
      error: "Pilih L atau P dari dropdown.",
    };
  }

  // Baris contoh
  sheet.addRow(["Contoh: Ahmad Fauzi", "L", "2024001"]);
  sheet.getRow(2).font = { italic: true, color: { argb: "FF94A3B8" } };

  const buffer = await workbook.xlsx.writeBuffer();
  const base64 = Buffer.from(buffer).toString("base64");

  const namaFile = kelas.nama.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
  return {
    success: true,
    base64,
    filename: `template-import-${namaFile}.xlsx`,
  };
}

/**
 * Import siswa dari Excel ke kelas tertentu.
 * kelasId di-pass dari formData.
 */
export async function importSiswaAction(formData: FormData): Promise<ImportResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN_SEKOLAH" || !user.sekolahId) {
    return { success: false, message: "Tidak terautentikasi." };
  }

  const kelasId = String(formData.get("kelasId") || "").trim();
  const file = formData.get("file") as File | null;

  if (!kelasId) return { success: false, message: "Kelas belum dipilih." };
  if (!file || file.size === 0) return { success: false, message: "File belum dipilih." };

  // Validasi kelas milik sekolah
  const kelas = await prisma.kelas.findFirst({
    where: { id: kelasId, sekolahId: user.sekolahId, isActive: true },
    select: { id: true, nama: true },
  });
  if (!kelas) return { success: false, message: "Kelas tidak valid." };

  const arrayBuffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(arrayBuffer);
  } catch {
    return { success: false, message: "File tidak valid atau bukan format .xlsx." };
  }

  const sheet = workbook.worksheets[0];
  if (!sheet) return { success: false, message: "Sheet tidak ditemukan di file." };

  const existingSiswa = await prisma.siswa.findMany({
    where: { sekolahId: user.sekolahId },
    select: { nis: true },
  });
  const existingNisSet = new Set(existingSiswa.map((s) => s.nis));

  type ValidRow = { baris: number; nama: string; nis: string; jenisKelamin: string };
  const validRows: ValidRow[] = [];
  const errors: ImportRowError[] = [];
  const nisInFile = new Set<string>();

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header

    // Kolom: A=Nama, B=Jenis Kelamin, C=NIS
    const nama = String(row.getCell(1).value ?? "").trim();
    const jenisKelaminRaw = String(row.getCell(2).value ?? "").trim().toUpperCase();
    const nis = String(row.getCell(3).value ?? "").trim();

    if (!nama && !jenisKelaminRaw && !nis) return; // baris kosong

    if (!nama) { errors.push({ baris: rowNumber, alasan: "Nama wajib diisi." }); return; }
    if (!["L", "P"].includes(jenisKelaminRaw)) {
      errors.push({ baris: rowNumber, alasan: `Jenis kelamin "${jenisKelaminRaw}" tidak valid (harus L/P).` }); return;
    }
    if (!nis) { errors.push({ baris: rowNumber, alasan: "NIS wajib diisi." }); return; }
    if (existingNisSet.has(nis)) {
      errors.push({ baris: rowNumber, alasan: `NIS "${nis}" sudah terdaftar di database.` }); return;
    }
    if (nisInFile.has(nis)) {
      errors.push({ baris: rowNumber, alasan: `NIS "${nis}" duplikat di dalam file ini.` }); return;
    }
    nisInFile.add(nis);
    validRows.push({ baris: rowNumber, nama, nis, jenisKelamin: jenisKelaminRaw });
  });

  if (validRows.length === 0) {
    return { success: false, message: "Tidak ada baris valid untuk diimport.", totalBerhasil: 0, totalGagal: errors.length, errors };
  }

  // Nomor absen mulai dari jumlah siswa yang sudah ada di kelas
  const existingCount = await prisma.siswaKelas.count({
    where: { kelasId, tanggalKeluar: null },
  });

  // Urutkan alfabetis untuk penentuan nomor absen
  const sorted = [...validRows].sort((a, b) => a.nama.localeCompare(b.nama, "id"));
  const nomorAbsenMap = new Map<string, number>();
  sorted.forEach((r, idx) => {
    nomorAbsenMap.set(r.nis, existingCount + idx + 1);
  });

  try {
    await prisma.$transaction(
      validRows.map((r) =>
        prisma.siswa.create({
          data: {
            sekolahId: user.sekolahId!,
            nis: r.nis,
            nama: r.nama,
            jenisKelamin: r.jenisKelamin,
            isActive: true,
            kelas: {
              create: {
                kelasId,
                nomorAbsen: nomorAbsenMap.get(r.nis)!,
              },
            },
          },
        })
      )
    );
  } catch (error) {
    console.error(error);
    return { success: false, message: "Terjadi kesalahan saat menyimpan data ke database." };
  }

  return {
    success: true,
    message:
      errors.length === 0
        ? `Berhasil mengimport ${validRows.length} siswa ke kelas ${kelas.nama}.`
        : `Berhasil mengimport ${validRows.length} siswa ke kelas ${kelas.nama}. ${errors.length} baris gagal.`,
    totalBerhasil: validRows.length,
    totalGagal: errors.length,
    errors,
  };
}

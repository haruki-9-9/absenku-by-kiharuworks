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

const HEADER = ["Nama Siswa", "NIS", "Jenis Kelamin (L/P)", "Kelas"];

/**
 * Generate file template Excel (.xlsx) berisi header + dropdown validation
 * untuk kolom Jenis Kelamin dan Kelas, dikirim sebagai base64 ke client.
 */
export async function generateTemplateAction(): Promise<
  { success: true; base64: string; filename: string } | { success: false; message: string }
> {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN_SEKOLAH" || !user.sekolahId) {
    return { success: false, message: "Tidak terautentikasi." };
  }

  const kelasList = await prisma.kelas.findMany({
    where: { sekolahId: user.sekolahId, isActive: true },
    orderBy: { nama: "asc" },
    select: { nama: true },
  });

  if (kelasList.length === 0) {
    return { success: false, message: "Belum ada kelas aktif. Tambahkan kelas terlebih dahulu." };
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Import Siswa");

  // Sheet tersembunyi untuk daftar kelas (sumber dropdown)
  const refSheet = workbook.addWorksheet("_RefKelas");
  refSheet.state = "veryHidden";
  kelasList.forEach((k, idx) => {
    refSheet.getCell(`A${idx + 1}`).value = k.nama;
  });
  const refRange = `_RefKelas!$A$1:$A$${kelasList.length}`;

  // Header
  sheet.addRow(HEADER);
  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6366F1" } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  sheet.columns = [
    { width: 28 }, // Nama
    { width: 16 }, // NIS
    { width: 20 }, // Jenis Kelamin
    { width: 18 }, // Kelas
  ];

  // Dropdown validation untuk 200 baris ke bawah
  const MAX_ROWS = 200;
  for (let i = 2; i <= MAX_ROWS + 1; i++) {
    sheet.getCell(`C${i}`).dataValidation = {
      type: "list",
      allowBlank: false,
      formulae: ['"L,P"'],
      showErrorMessage: true,
      errorTitle: "Jenis Kelamin tidak valid",
      error: "Pilih L atau P dari dropdown.",
    };
    sheet.getCell(`D${i}`).dataValidation = {
      type: "list",
      allowBlank: false,
      formulae: [refRange],
      showErrorMessage: true,
      errorTitle: "Kelas tidak valid",
      error: "Pilih kelas dari dropdown yang tersedia.",
    };
  }

  // Contoh baris (akan diabaikan saat parsing jika NIS-nya kosong/placeholder)
  sheet.addRow(["Contoh: Ahmad Fauzi", "2024001", "L", kelasList[0].nama]);
  sheet.getRow(2).font = { italic: true, color: { argb: "FF94A3B8" } };

  const buffer = await workbook.xlsx.writeBuffer();
  const base64 = Buffer.from(buffer).toString("base64");

  return {
    success: true,
    base64,
    filename: `template-import-siswa-${user.sekolahId.slice(0, 8)}.xlsx`,
  };
}

/**
 * Parse file Excel yang diupload, validasi setiap baris, lalu insert
 * siswa + assign ke kelas (nomor absen otomatis alfabetis per kelas).
 */
export async function importSiswaAction(formData: FormData): Promise<ImportResult> {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN_SEKOLAH" || !user.sekolahId) {
    return { success: false, message: "Tidak terautentikasi." };
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { success: false, message: "File belum dipilih." };
  }

  const arrayBuffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();

  try {
    await workbook.xlsx.load(arrayBuffer);
  } catch {
    return { success: false, message: "File tidak valid atau bukan format .xlsx." };
  }

  const sheet = workbook.worksheets[0];
  if (!sheet) {
    return { success: false, message: "Sheet tidak ditemukan di file." };
  }

  const kelasList = await prisma.kelas.findMany({
    where: { sekolahId: user.sekolahId, isActive: true },
    select: { id: true, nama: true },
  });
  const kelasMap = new Map<string, string>(
    kelasList.map((k) => [k.nama.trim().toLowerCase(), k.id])
  );

  const existingSiswa = await prisma.siswa.findMany({
    where: { sekolahId: user.sekolahId },
    select: { nis: true },
  });
  const existingNisSet = new Set(existingSiswa.map((s) => s.nis));

  type ValidRow = { baris: number; nama: string; nis: string; jenisKelamin: string; kelasId: string };
  const validRows: ValidRow[] = [];
  const errors: ImportRowError[] = [];
  const nisInFile = new Set<string>();

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header

    const nama = String(row.getCell(1).value ?? "").trim();
    const nis = String(row.getCell(2).value ?? "").trim();
    const jenisKelaminRaw = String(row.getCell(3).value ?? "").trim().toUpperCase();
    const kelasNama = String(row.getCell(4).value ?? "").trim();

    // Baris kosong total, lewati tanpa dianggap error
    if (!nama && !nis && !jenisKelaminRaw && !kelasNama) return;

    if (!nama) {
      errors.push({ baris: rowNumber, alasan: "Nama wajib diisi." });
      return;
    }
    if (!nis) {
      errors.push({ baris: rowNumber, alasan: "NIS wajib diisi." });
      return;
    }
    if (!["L", "P"].includes(jenisKelaminRaw)) {
      errors.push({ baris: rowNumber, alasan: `Jenis kelamin "${jenisKelaminRaw}" tidak valid (harus L/P).` });
      return;
    }
    if (!kelasNama) {
      errors.push({ baris: rowNumber, alasan: "Kelas wajib diisi." });
      return;
    }

    const kelasId = kelasMap.get(kelasNama.toLowerCase());
    if (!kelasId) {
      errors.push({ baris: rowNumber, alasan: `Kelas "${kelasNama}" tidak ditemukan atau tidak aktif.` });
      return;
    }

    if (existingNisSet.has(nis)) {
      errors.push({ baris: rowNumber, alasan: `NIS "${nis}" sudah terdaftar di database.` });
      return;
    }

    if (nisInFile.has(nis)) {
      errors.push({ baris: rowNumber, alasan: `NIS "${nis}" duplikat di dalam file ini.` });
      return;
    }
    nisInFile.add(nis);

    validRows.push({ baris: rowNumber, nama, nis, jenisKelamin: jenisKelaminRaw, kelasId });
  });

  if (validRows.length === 0) {
    return {
      success: false,
      message: "Tidak ada baris valid untuk diimport.",
      totalBerhasil: 0,
      totalGagal: errors.length,
      errors,
    };
  }

  // Hitung nomor absen mulai per kelas (berdasarkan data existing di kelas tsb)
  const kelasIdsTerpakai = [...new Set(validRows.map((r) => r.kelasId))];
  const existingCounts = await prisma.siswaKelas.findMany({
    where: { kelasId: { in: kelasIdsTerpakai }, tanggalKeluar: null },
    select: { kelasId: true },
  });
  const startNomorPerKelas = new Map<string, number>();
  kelasIdsTerpakai.forEach((kelasId) => {
    const count = existingCounts.filter((e) => e.kelasId === kelasId).length;
    startNomorPerKelas.set(kelasId, count);
  });

  // Urutkan alfabetis nama PER kelas untuk penentuan nomor absen baru
  const rowsByKelas = new Map<string, ValidRow[]>();
  validRows.forEach((r) => {
    const arr = rowsByKelas.get(r.kelasId) ?? [];
    arr.push(r);
    rowsByKelas.set(r.kelasId, arr);
  });

  const nomorAbsenMap = new Map<string, number>(); // key: nis -> nomorAbsen
  rowsByKelas.forEach((rows, kelasId) => {
    const sorted = [...rows].sort((a, b) => a.nama.localeCompare(b.nama, "id"));
    let nomor = startNomorPerKelas.get(kelasId) ?? 0;
    sorted.forEach((r) => {
      nomor += 1;
      nomorAbsenMap.set(r.nis, nomor);
    });
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
                kelasId: r.kelasId,
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
        ? `Berhasil mengimport ${validRows.length} siswa.`
        : `Berhasil mengimport ${validRows.length} siswa. ${errors.length} baris gagal, lihat detail di bawah.`,
    totalBerhasil: validRows.length,
    totalGagal: errors.length,
    errors,
  };
}

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { NextRequest, NextResponse } from "next/server";

const NAMA_HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const NAMA_BULAN = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !user.sekolahId || user.role !== "ADMIN_SEKOLAH") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    namaSekolah, namaKelas, programKeahlian, tahunAjaran,
    namaWaliKelas, siswa, tanggalMulai,
  } = body;

  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = "absenku";
  wb.created = new Date();

  // Hitung hari Senin-Jumat minggu ini
  const monday = new Date(tanggalMulai);
  const weekDays: Date[] = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const bulan = NAMA_BULAN[monday.getMonth() + 1];
  const tahunAngka = monday.getFullYear();

  const ws = wb.addWorksheet(namaKelas, {
    pageSetup: {
      paperSize: 13, // F4
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 },
    },
  });

  // ── Warna ──
  const cIndigo = "FF6366F1";
  const _cIndigoBg = "FFE0E7FF";
  const cHeaderBg = "FFF5F5FF";
  const cBorder = "FFD1D5DB";
  const cGray = "FFF8FAFC";

  // ── Layout kolom ──
  // A=No, B=Nama Siswa, C=L/P
  // D..W = 5 hari x 4 jam = 20 kolom
  // X=S, Y=I, Z=A, AA=Jml
  const COL_NO = 1;
  const COL_NAMA = 2;
  const COL_LP = 3;
  const COL_HARI_START = 4; // Senin jam 1
  // Per hari: 4 kolom (jam 1,2,3,4)
  const COL_REKAP_S = COL_HARI_START + 20; // 24
  const COL_REKAP_I = COL_REKAP_S + 1;     // 25
  const COL_REKAP_A = COL_REKAP_I + 1;     // 26
  const COL_REKAP_JML = COL_REKAP_A + 1;   // 27
  const TOTAL_COLS = COL_REKAP_JML;

  // Lebar kolom
  ws.getColumn(COL_NO).width = 4;
  ws.getColumn(COL_NAMA).width = 24;
  ws.getColumn(COL_LP).width = 4;
  for (let c = COL_HARI_START; c < COL_HARI_START + 20; c++) {
    ws.getColumn(c).width = 3.5;
  }
  ws.getColumn(COL_REKAP_S).width = 4;
  ws.getColumn(COL_REKAP_I).width = 4;
  ws.getColumn(COL_REKAP_A).width = 4;
  ws.getColumn(COL_REKAP_JML).width = 5;

  const thin = { style: "thin" as const, color: { argb: cBorder } };
  const border = { top: thin, bottom: thin, left: thin, right: thin };

  const centerMiddle = { horizontal: "center" as const, vertical: "middle" as const, wrapText: true };
  const leftMiddle = { horizontal: "left" as const, vertical: "middle" as const };

  let row = 1;

  // ── Baris 1: Judul ──
  ws.mergeCells(row, 1, row, TOTAL_COLS);
  const rJudul = ws.getRow(row);
  rJudul.getCell(1).value = "DAFTAR HADIR HARIAN SISWA";
  rJudul.getCell(1).font = { bold: true, size: 13, color: { argb: "FF1E1B4B" } };
  rJudul.getCell(1).alignment = centerMiddle;
  rJudul.height = 22;
  row++;

  // ── Baris 2: kosong ──
  ws.getRow(row).height = 4;
  row++;

  // ── Header info 3 baris ──
  // Format: kiri (Bidang/Program/Kompetensi) | kanan (Kelas/Th.Pelajaran/Bulan)
  const infoRows = [
    [`Kompetensi Keahlian	: ${programKeahlian ?? ""}`, `Kelas /Sem	: ${namaKelas} /`],
    [`Nama Sekolah		: ${namaSekolah}`, `Th. Pelajaran	: ${tahunAjaran}`],
    [``, `Bulan		: ${bulan.toUpperCase()}`],
  ];

  const splitCol = 14; // kolom split kiri/kanan
  for (const [left, right] of infoRows) {
    const r = ws.getRow(row);
    ws.mergeCells(row, 1, row, splitCol - 1);
    ws.mergeCells(row, splitCol, row, TOTAL_COLS);
    r.getCell(1).value = left;
    r.getCell(splitCol).value = right;
    r.getCell(1).font = { size: 9 };
    r.getCell(splitCol).font = { size: 9 };
    r.getCell(1).alignment = leftMiddle;
    r.getCell(splitCol).alignment = leftMiddle;
    r.height = 14;
    row++;
  }

  ws.getRow(row).height = 4;
  row++;

  // ── Header tabel ── 4 baris header
  const _headerStartRow = row;

  // Baris H1: No | Nama Siswa | L/P | [Senin...] | [Selasa...] | ... | Absensi
  const rH1 = ws.getRow(row);
  rH1.height = 16;

  // No - merge 4 baris
  ws.mergeCells(row, COL_NO, row + 3, COL_NO);
  const cellNo = rH1.getCell(COL_NO);
  cellNo.value = "No";
  cellNo.font = { bold: true, size: 9, color: { argb: "FFFFFFFF" } };
  cellNo.fill = { type: "pattern", pattern: "solid", fgColor: { argb: cIndigo } };
  cellNo.alignment = centerMiddle;
  cellNo.border = border;

  // Nama Siswa - merge 4 baris
  ws.mergeCells(row, COL_NAMA, row + 3, COL_NAMA);
  const cellNama = rH1.getCell(COL_NAMA);
  cellNama.value = "Nama Siswa";
  cellNama.font = { bold: true, size: 9, color: { argb: "FFFFFFFF" } };
  cellNama.fill = { type: "pattern", pattern: "solid", fgColor: { argb: cIndigo } };
  cellNama.alignment = centerMiddle;
  cellNama.border = border;

  // L/P - merge 4 baris
  ws.mergeCells(row, COL_LP, row + 3, COL_LP);
  const cellLP = rH1.getCell(COL_LP);
  cellLP.value = "L /\nP";
  cellLP.font = { bold: true, size: 9, color: { argb: "FFFFFFFF" } };
  cellLP.fill = { type: "pattern", pattern: "solid", fgColor: { argb: cIndigo } };
  cellLP.alignment = centerMiddle;
  cellLP.border = border;

  // Per hari: merge 4 kolom di baris H1
  for (let h = 0; h < 5; h++) {
    const colStart = COL_HARI_START + h * 4;
    ws.mergeCells(row, colStart, row, colStart + 3);
    const cellHari = rH1.getCell(colStart);
    cellHari.value = NAMA_HARI[weekDays[h].getDay()];
    cellHari.font = { bold: true, size: 9, color: { argb: "FFFFFFFF" } };
    cellHari.fill = { type: "pattern", pattern: "solid", fgColor: { argb: cIndigo } };
    cellHari.alignment = centerMiddle;
    cellHari.border = border;
  }

  // Absensi - merge 4 baris
  ws.mergeCells(row, COL_REKAP_S, row + 3, COL_REKAP_JML);
  const cellAbsensi = rH1.getCell(COL_REKAP_S);
  cellAbsensi.value = "Absensi";
  cellAbsensi.font = { bold: true, size: 9, color: { argb: "FFFFFFFF" } };
  cellAbsensi.fill = { type: "pattern", pattern: "solid", fgColor: { argb: cIndigo } };
  cellAbsensi.alignment = centerMiddle;
  cellAbsensi.border = border;

  row++;

  // Baris H2: Tgl per hari
  const rH2 = ws.getRow(row);
  rH2.height = 14;
  for (let h = 0; h < 5; h++) {
    const colStart = COL_HARI_START + h * 4;
    const d = weekDays[h];
    const tglStr = `Tgl:${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
    ws.mergeCells(row, colStart, row, colStart + 3);
    const cell = rH2.getCell(colStart);
    cell.value = tglStr;
    cell.font = { size: 8, color: { argb: "FF4B5563" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: cHeaderBg } };
    cell.alignment = centerMiddle;
    cell.border = border;
  }
  row++;

  // Baris H3: "Jam Ke" per hari
  const rH3 = ws.getRow(row);
  rH3.height = 12;
  for (let h = 0; h < 5; h++) {
    const colStart = COL_HARI_START + h * 4;
    ws.mergeCells(row, colStart, row, colStart + 3);
    const cell = rH3.getCell(colStart);
    cell.value = "Jam Ke";
    cell.font = { size: 8, color: { argb: "FF6B7280" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: cHeaderBg } };
    cell.alignment = centerMiddle;
    cell.border = border;
  }
  row++;

  // Baris H4: 1 2 3 4 per hari + S I A Jml
  const rH4 = ws.getRow(row);
  rH4.height = 12;
  for (let h = 0; h < 5; h++) {
    for (let j = 0; j < 4; j++) {
      const col = COL_HARI_START + h * 4 + j;
      const cell = rH4.getCell(col);
      cell.value = j + 1;
      cell.font = { bold: true, size: 8, color: { argb: cIndigo } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: cHeaderBg } };
      cell.alignment = centerMiddle;
      cell.border = border;
    }
  }
  // S I A Jml headers
  for (const [col, label] of [
    [COL_REKAP_S, "S"], [COL_REKAP_I, "I"], [COL_REKAP_A, "A"], [COL_REKAP_JML, "Jml"],
  ] as [number, string][]) {
    const cell = rH4.getCell(col);
    cell.value = label;
    cell.font = { bold: true, size: 8, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: cIndigo } };
    cell.alignment = centerMiddle;
    cell.border = border;
  }
  row++;

  // ── Baris data siswa ──
  const _siswaStartRow = row;
  const sortedSiswa = [...siswa].sort((a: {nomorAbsen: number}, b: {nomorAbsen: number}) => a.nomorAbsen - b.nomorAbsen);

  for (let i = 0; i < sortedSiswa.length; i++) {
    const s = sortedSiswa[i];
    const r = ws.getRow(row);
    r.height = 15;

    // No
    r.getCell(COL_NO).value = s.nomorAbsen;
    r.getCell(COL_NO).alignment = centerMiddle;
    r.getCell(COL_NO).border = border;
    r.getCell(COL_NO).font = { size: 9 };

    // Nama
    r.getCell(COL_NAMA).value = s.nama;
    r.getCell(COL_NAMA).alignment = leftMiddle;
    r.getCell(COL_NAMA).border = border;
    r.getCell(COL_NAMA).font = { size: 9 };

    // L/P
    r.getCell(COL_LP).value = s.jenisKelamin === "L" ? "L" : "P";
    r.getCell(COL_LP).alignment = centerMiddle;
    r.getCell(COL_LP).border = border;
    r.getCell(COL_LP).font = { size: 9 };

    // Sel kosong per jam
    for (let c = COL_HARI_START; c < COL_HARI_START + 20; c++) {
      r.getCell(c).border = border;
      if (i % 2 === 1) {
        r.getCell(c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: cGray } };
      }
    }

    // Rekap S I A Jml (kosong)
    for (const col of [COL_REKAP_S, COL_REKAP_I, COL_REKAP_A, COL_REKAP_JML]) {
      r.getCell(col).border = border;
      r.getCell(col).alignment = centerMiddle;
    }

    row++;
  }

  const _siswaEndRow = row - 1;

  // ── Baris jumlah harian ──
  ws.getRow(row).height = 4;
  row++;

  for (const label of ["S", "I", "A"]) {
    const r = ws.getRow(row);
    r.height = 13;
    if (label === "S") {
      ws.mergeCells(row, COL_NO, row, COL_LP - 1);
      const cell = r.getCell(COL_NO);
      cell.value = "JUMLAH HARIAN";
      cell.font = { bold: true, size: 9 };
      cell.alignment = leftMiddle;
    }
    r.getCell(COL_LP).value = label;
    r.getCell(COL_LP).font = { bold: true, size: 9 };
    r.getCell(COL_LP).alignment = centerMiddle;
    r.getCell(COL_LP).border = border;
    for (let c = COL_HARI_START; c < COL_HARI_START + 20; c++) {
      r.getCell(c).border = border;
    }
    // Count L/P/JT
    if (label === "S") {
      const lCount = sortedSiswa.filter((s: {jenisKelamin: string}) => s.jenisKelamin === "L").length;
      r.getCell(COL_REKAP_S).value = "L";
      r.getCell(COL_REKAP_S).font = { bold: true, size: 9 };
      r.getCell(COL_REKAP_I).value = lCount;
      r.getCell(COL_REKAP_I).font = { size: 9 };
    } else if (label === "I") {
      const pCount = sortedSiswa.filter((s: {jenisKelamin: string}) => s.jenisKelamin !== "L").length;
      r.getCell(COL_REKAP_S).value = "P";
      r.getCell(COL_REKAP_S).font = { bold: true, size: 9 };
      r.getCell(COL_REKAP_I).value = pCount;
      r.getCell(COL_REKAP_I).font = { size: 9 };
    } else {
      r.getCell(COL_REKAP_S).value = "JT";
      r.getCell(COL_REKAP_S).font = { bold: true, size: 9 };
      r.getCell(COL_REKAP_I).value = sortedSiswa.length;
      r.getCell(COL_REKAP_I).font = { size: 9 };
    }
    for (const col of [COL_REKAP_S, COL_REKAP_I]) {
      r.getCell(col).alignment = centerMiddle;
      r.getCell(col).border = border;
    }
    row++;
  }

  // ── Spasi ──
  ws.getRow(row).height = 10;
  row++;

  // ── Footer ──
  const tempatTgl = `${namaSekolah.split(" ")[0] || "Sekolah"}, ${String(monday.getDate()).padStart(2,"0")} ${bulan} ${tahunAngka}`;

  ws.mergeCells(row, 1, row, TOTAL_COLS);
  row++;

  // Tempat, tanggal di kanan
  ws.mergeCells(row, COL_HARI_START + 12, row, TOTAL_COLS);
  ws.getRow(row).getCell(COL_HARI_START + 12).value = tempatTgl;
  ws.getRow(row).getCell(COL_HARI_START + 12).font = { size: 9 };
  ws.getRow(row).getCell(COL_HARI_START + 12).alignment = centerMiddle;
  ws.getRow(row).height = 13;
  row++;

  // Label Wali Kelas
  ws.mergeCells(row, COL_HARI_START + 12, row, TOTAL_COLS);
  ws.getRow(row).getCell(COL_HARI_START + 12).value = "Wali Kelas";
  ws.getRow(row).getCell(COL_HARI_START + 12).font = { size: 9 };
  ws.getRow(row).getCell(COL_HARI_START + 12).alignment = centerMiddle;
  ws.getRow(row).height = 13;
  row++;

  // Spasi TTD
  for (let i = 0; i < 4; i++) {
    ws.getRow(row).height = 13;
    row++;
  }

  // Nama Wali Kelas
  ws.mergeCells(row, COL_HARI_START + 12, row, TOTAL_COLS);
  ws.getRow(row).getCell(COL_HARI_START + 12).value = namaWaliKelas ?? "";
  ws.getRow(row).getCell(COL_HARI_START + 12).font = { bold: true, size: 9, underline: true };
  ws.getRow(row).getCell(COL_HARI_START + 12).alignment = centerMiddle;
  ws.getRow(row).height = 13;

  // Output
  const buffer = await wb.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="form_absensi.xlsx"`,
    },
  });
}

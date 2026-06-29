import { getCurrentUser } from "@/lib/auth/get-current-user";
import { NextRequest, NextResponse } from "next/server";

const NAMA_BULAN = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const NAMA_HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !user.sekolahId || user.role !== "ADMIN_SEKOLAH") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { namaSekolah, alamatSekolah, tahunAjaran, namaKelas, bulan, tahun, jumlahHari, liburMap, siswaData } = body;

  // Dynamic import ExcelJS
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = "absenku";
  wb.created = new Date();

  const ws = wb.addWorksheet(`${NAMA_BULAN[bulan]} ${tahun}`, {
    pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1 },
  });

  // ── Warna tema ──
  const colorIndigo = "FF6366F1";
  const colorIndigoDark = "FF4F46E5";
  const colorHeaderBg = "FFF0F0FF"; // indigo sangat muda
  const colorSakit = "FFFFF7E0";    // kuning muda
  const colorSakitText = "FFB45309";
  const colorIzin = "FFE0EEFF";     // biru muda
  const colorIzinText = "FF1D4ED8";
  const colorAlpa = "FFFEE0E0";     // merah muda
  const colorAlpaText = "FFB91C1C";
  const colorLibur = "FFF1F5F9";    // abu muda
  const colorLiburText = "FF94A3B8";
  const colorHadir = "FFFFFFFF";    // putih
  const colorHadirText = "FF059669";

  const days = Array.from({ length: jumlahHari }, (_, i) => i + 1);

  // ── Kolom ──
  // Col A = No, Col B = Nama, Col C..C+jumlahHari-1 = tanggal, lalu S I A Hrs Hadir %
  const colTanggalStart = 3;
  const colTanggalEnd = colTanggalStart + jumlahHari - 1;
  const colS = colTanggalEnd + 1;
  const colI = colS + 1;
  const colA = colI + 1;
  const colHrs = colA + 1;
  const colHadir = colHrs + 1;
  const colPersen = colHadir + 1;
  const totalCols = colPersen;

  // Set lebar kolom
  ws.getColumn(1).width = 5;   // No
  ws.getColumn(2).width = 22;  // Nama
  for (let d = 1; d <= jumlahHari; d++) {
    ws.getColumn(colTanggalStart + d - 1).width = 4;
  }
  ws.getColumn(colS).width = 5;
  ws.getColumn(colI).width = 5;
  ws.getColumn(colA).width = 5;
  ws.getColumn(colHrs).width = 6;
  ws.getColumn(colHadir).width = 7;
  ws.getColumn(colPersen).width = 7;

  // ── Baris 1: Judul ──
  ws.mergeCells(1, 1, 1, totalCols);
  const r1 = ws.getRow(1);
  r1.getCell(1).value = "REKAP ABSENSI BULANAN";
  r1.getCell(1).font = { bold: true, size: 13, color: { argb: colorIndigoDark } };
  r1.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
  r1.height = 22;

  // ── Baris 2: Nama Sekolah ──
  ws.mergeCells(2, 1, 2, totalCols);
  const r2 = ws.getRow(2);
  r2.getCell(1).value = namaSekolah;
  r2.getCell(1).font = { bold: true, size: 12, color: { argb: "FF0F172A" } };
  r2.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
  r2.height = 18;

  // ── Baris 3: Alamat ──
  if (alamatSekolah) {
    ws.mergeCells(3, 1, 3, totalCols);
    ws.getRow(3).getCell(1).value = alamatSekolah;
    ws.getRow(3).getCell(1).font = { size: 10, color: { argb: "FF64748B" } };
    ws.getRow(3).getCell(1).alignment = { horizontal: "center" };
  }

  // ── Baris 4: Info ──
  ws.mergeCells(4, 1, 4, totalCols);
  ws.getRow(4).getCell(1).value =
    `Tahun Ajaran: ${tahunAjaran}   |   Kelas: ${namaKelas}   |   Bulan: ${NAMA_BULAN[bulan]} ${tahun}`;
  ws.getRow(4).getCell(1).font = { size: 10, color: { argb: "FF475569" } };
  ws.getRow(4).getCell(1).alignment = { horizontal: "center" };
  ws.getRow(4).height = 16;

  // Garis bawah header info
  for (let c = 1; c <= totalCols; c++) {
    ws.getRow(4).getCell(c).border = {
      bottom: { style: "medium", color: { argb: colorIndigo } },
    };
  }

  // ── Baris 5: blank ──
  ws.getRow(5).height = 6;

  // ── Baris 6: Header hari (singkatan) ──
  const rowHari = ws.getRow(6);
  rowHari.height = 14;
  rowHari.getCell(1).value = "No";
  rowHari.getCell(2).value = "Nama Siswa";

  days.forEach((d) => {
    const hariIdx = new Date(tahun, bulan - 1, d).getDay();
    const isMinggu = hariIdx === 0;
    const isLibur = !!liburMap[d];
    const cell = rowHari.getCell(colTanggalStart + d - 1);
    cell.value = NAMA_HARI[hariIdx];
    cell.font = { size: 8, bold: true, color: { argb: isMinggu || isLibur ? colorLiburText : "FF64748B" } };
    cell.alignment = { horizontal: "center" };
    if (isMinggu || isLibur) {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colorLibur } };
    }
  });

  const headerLabels: [number, string, string][] = [
    [colS, "S", colorSakitText],
    [colI, "I", colorIzinText],
    [colA, "A", colorAlpaText],
    [colHrs, "Hrs", "FF475569"],
    [colHadir, "Hadir", colorHadirText],
    [colPersen, "%", colorIndigo],
  ];
  headerLabels.forEach(([col, label, color]) => {
    const c = rowHari.getCell(col);
    c.value = label;
    c.font = { bold: true, size: 9, color: { argb: color } };
    c.alignment = { horizontal: "center" };
  });

  applyHeaderStyle(rowHari, totalCols, colorHeaderBg, colorIndigo);

  // ── Baris 7: Header tanggal (angka) ──
  const rowTgl = ws.getRow(7);
  rowTgl.height = 16;
  rowTgl.getCell(1).value = "";
  rowTgl.getCell(2).value = "";

  days.forEach((d) => {
    const hariIdx = new Date(tahun, bulan - 1, d).getDay();
    const isMinggu = hariIdx === 0;
    const isLibur = !!liburMap[d];
    const cell = rowTgl.getCell(colTanggalStart + d - 1);
    cell.value = d;
    cell.font = { size: 10, bold: true, color: { argb: isMinggu || isLibur ? colorLiburText : "FF0F172A" } };
    cell.alignment = { horizontal: "center" };
    if (isMinggu || isLibur) {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colorLibur } };
    }
  });

  applyHeaderStyle(rowTgl, totalCols, colorHeaderBg, colorIndigo);

  // ── Baris data siswa ──
  let totalS = 0, totalI = 0, totalA = 0;
  const dataStartRow = 8;

  siswaData.forEach((siswa: Record<string, number> & { nomorAbsen: number; nama: string; absen: Record<number, string>; totalS: number; totalI: number; totalA: number; seharusnya: number; realisasi: number; persen: number }, idx: number) => {
    const rowNum = dataStartRow + idx;
    const row = ws.getRow(rowNum);
    row.height = 15;

    const isStripe = idx % 2 !== 0;
    const stripeBg = isStripe ? "FFF8F7FF" : colorHadir;

    row.getCell(1).value = siswa.nomorAbsen;
    row.getCell(1).font = { size: 10, color: { argb: "FF94A3B8" } };
    row.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
    styleDataCell(row.getCell(1), stripeBg, colorIndigo);

    row.getCell(2).value = siswa.nama;
    row.getCell(2).font = { size: 10, bold: true, color: { argb: "FF0F172A" } };
    row.getCell(2).alignment = { horizontal: "left", vertical: "middle", indent: 1 };
    styleDataCell(row.getCell(2), stripeBg, colorIndigo);

    days.forEach((d) => {
      const hariIdx = new Date(tahun, bulan - 1, d).getDay();
      const isMinggu = hariIdx === 0;
      const isLibur = !!liburMap[d];
      const status: string = isMinggu ? "–" : isLibur ? "L" : (siswa.absen[d] ?? "H");
      const cell = row.getCell(colTanggalStart + d - 1);
      cell.value = status;
      cell.alignment = { horizontal: "center", vertical: "middle" };

      let bg = stripeBg;
      let textColor = "FF0F172A";

      if (isMinggu || isLibur) { bg = colorLibur; textColor = colorLiburText; }
      else if (status === "S") { bg = colorSakit; textColor = colorSakitText; }
      else if (status === "I") { bg = colorIzin; textColor = colorIzinText; }
      else if (status === "A") { bg = colorAlpa; textColor = colorAlpaText; }
      else if (status === "H") { textColor = colorHadirText; }

      cell.font = { size: 9, bold: status !== "H" && status !== "–", color: { argb: textColor } };
      styleDataCell(cell, bg, colorIndigo);
    });

    // Kolom ringkasan
    const sumCells: [number, number, string, string][] = [
      [colS, siswa.totalS, colorSakit, colorSakitText],
      [colI, siswa.totalI, colorIzin, colorIzinText],
      [colA, siswa.totalA, colorAlpa, colorAlpaText],
      [colHrs, siswa.seharusnya, stripeBg, "FF475569"],
      [colHadir, siswa.realisasi, stripeBg, colorHadirText],
    ];
    sumCells.forEach(([col, val, bg, tc]) => {
      const c = row.getCell(col);
      c.value = val;
      c.font = { size: 10, bold: true, color: { argb: tc } };
      c.alignment = { horizontal: "center", vertical: "middle" };
      styleDataCell(c, bg, colorIndigo);
    });

    const pCell = row.getCell(colPersen);
    const persenColor = siswa.persen >= 80 ? colorHadirText : siswa.persen >= 60 ? colorSakitText : colorAlpaText;
    pCell.value = `${siswa.persen}%`;
    pCell.font = { size: 10, bold: true, color: { argb: persenColor } };
    pCell.alignment = { horizontal: "center", vertical: "middle" };
    styleDataCell(pCell, stripeBg, colorIndigo);

    totalS += siswa.totalS;
    totalI += siswa.totalI;
    totalA += siswa.totalA;
  });

  // ── Baris Total ──
  const totalRowNum = dataStartRow + siswaData.length;
  const totalRow = ws.getRow(totalRowNum);
  totalRow.height = 16;

  const tcMergeEnd = colTanggalStart - 1;
  ws.mergeCells(totalRowNum, 1, totalRowNum, tcMergeEnd);
  totalRow.getCell(1).value = "TOTAL";
  totalRow.getCell(1).font = { bold: true, size: 10, color: { argb: colorIndigoDark } };
  totalRow.getCell(1).alignment = { horizontal: "right", vertical: "middle" };
  styleDataCell(totalRow.getCell(1), colorHeaderBg, colorIndigo);

  days.forEach((d) => {
    const c = totalRow.getCell(colTanggalStart + d - 1);
    styleDataCell(c, colorHeaderBg, colorIndigo);
  });

  const totals: [number, number, string, string][] = [
    [colS, totalS, colorSakit, colorSakitText],
    [colI, totalI, colorIzin, colorIzinText],
    [colA, totalA, colorAlpa, colorAlpaText],
  ];
  totals.forEach(([col, val, bg, tc]) => {
    const c = totalRow.getCell(col);
    c.value = val;
    c.font = { bold: true, size: 11, color: { argb: tc } };
    c.alignment = { horizontal: "center", vertical: "middle" };
    styleDataCell(c, bg, colorIndigo);
  });

  [colHrs, colHadir, colPersen].forEach((col) => {
    styleDataCell(totalRow.getCell(col), colorHeaderBg, colorIndigo);
  });

  // Garis atas total
  for (let c = 1; c <= totalCols; c++) {
    const cell = totalRow.getCell(c);
    cell.border = {
      ...cell.border,
      top: { style: "medium", color: { argb: colorIndigo } },
      bottom: { style: "medium", color: { argb: colorIndigo } },
    };
  }

  // ── Generate buffer ──
  const buffer = await wb.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="Rekap_${namaKelas}_${NAMA_BULAN[bulan]}_${tahun}.xlsx"`,
    },
  });
}

function applyHeaderStyle(row: import("exceljs").Row, totalCols: number, bg: string, _borderColor: string) {
  for (let c = 1; c <= totalCols; c++) {
    const cell = row.getCell(c);
    if (!cell.fill || cell.fill.fgColor?.argb === "FFFFFFFF") {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
    }
    cell.border = {
      top: { style: "thin", color: { argb: _borderColor } },
      bottom: { style: "thin", color: { argb: _borderColor } },
      left: { style: "hair", color: { argb: "FFE2E8F0" } },
      right: { style: "hair", color: { argb: "FFE2E8F0" } },
    };
    if (!cell.alignment) cell.alignment = { horizontal: "center", vertical: "middle" };
  }
}

function styleDataCell(cell: import("exceljs").Cell, bg: string, borderColor: string) {
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
  cell.border = {
    top: { style: "hair", color: { argb: "FFE2E8F0" } },
    bottom: { style: "hair", color: { argb: "FFE2E8F0" } },
    left: { style: "hair", color: { argb: "FFE2E8F0" } },
    right: { style: "hair", color: { argb: "FFE2E8F0" } },
  };
}

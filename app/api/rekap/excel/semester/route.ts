import { getCurrentUser } from "@/lib/auth/get-current-user";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !user.sekolahId || user.role !== "ADMIN_SEKOLAH") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { namaSekolah, alamatSekolah, tahunAjaran, namaKelas, namaSemester, bulanList, siswaData } = body;

  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = "absenku";
  wb.created = new Date();

  const ws = wb.addWorksheet(namaSemester, {
    pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1 },
  });

  // ── Warna tema ──
  const colorIndigo     = "FF6366F1";
  const colorIndigoDark = "FF4F46E5";
  const colorPurple     = "FF8B5CF6";
  const colorHeaderBg   = "FFF0F0FF";
  const colorSakit      = "FFFFF7E0";
  const colorSakitText  = "FFB45309";
  const colorIzin       = "FFE0EEFF";
  const colorIzinText   = "FF1D4ED8";
  const colorAlpa       = "FFFEE0E0";
  const colorAlpaText   = "FFB91C1C";
  const colorStripe     = "FFF8F7FF";

  // Col A = No, B = Nama, lalu per bulan 3 col (S/I/A), lalu total 4 col (S/I/A/%)
  const colNama = 2;
  const colBulanStart = 3;
  const colsPerBulan = 3;
  const totalBulanCols = bulanList.length * colsPerBulan;
  const colTotalS = colBulanStart + totalBulanCols;
  const colTotalI = colTotalS + 1;
  const colTotalA = colTotalI + 1;
  const colPersen = colTotalA + 1;
  const totalCols = colPersen;

  // Lebar kolom
  ws.getColumn(1).width = 5;
  ws.getColumn(2).width = 24;
  for (let i = 0; i < totalBulanCols; i++) {
    ws.getColumn(colBulanStart + i).width = 5;
  }
  ws.getColumn(colTotalS).width = 5;
  ws.getColumn(colTotalI).width = 5;
  ws.getColumn(colTotalA).width = 5;
  ws.getColumn(colPersen).width = 7;

  // ── Baris 1: Judul ──
  ws.mergeCells(1, 1, 1, totalCols);
  ws.getRow(1).getCell(1).value = "REKAP ABSENSI SEMESTER";
  ws.getRow(1).getCell(1).font = { bold: true, size: 13, color: { argb: colorIndigoDark } };
  ws.getRow(1).getCell(1).alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(1).height = 22;

  // ── Baris 2: Nama Sekolah ──
  ws.mergeCells(2, 1, 2, totalCols);
  ws.getRow(2).getCell(1).value = namaSekolah;
  ws.getRow(2).getCell(1).font = { bold: true, size: 12, color: { argb: "FF0F172A" } };
  ws.getRow(2).getCell(1).alignment = { horizontal: "center" };
  ws.getRow(2).height = 18;

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
    `Tahun Ajaran: ${tahunAjaran}   |   Kelas: ${namaKelas}   |   Semester: ${namaSemester}`;
  ws.getRow(4).getCell(1).font = { size: 10, color: { argb: "FF475569" } };
  ws.getRow(4).getCell(1).alignment = { horizontal: "center" };
  ws.getRow(4).height = 16;
  for (let c = 1; c <= totalCols; c++) {
    ws.getRow(4).getCell(c).border = {
      bottom: { style: "medium", color: { argb: colorIndigo } },
    };
  }

  ws.getRow(5).height = 6;

  // ── Baris 6: Header grup bulan ──
  const rowGrup = ws.getRow(6);
  rowGrup.height = 16;
  ws.mergeCells(6, 1, 7, 1); // No
  ws.mergeCells(6, 2, 7, 2); // Nama

  rowGrup.getCell(1).value = "No";
  rowGrup.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
  rowGrup.getCell(1).font = { bold: true, size: 9, color: { argb: "FF64748B" } };
  styleHeaderCell(rowGrup.getCell(1), colorHeaderBg, colorIndigo);

  rowGrup.getCell(2).value = "Nama Siswa";
  rowGrup.getCell(2).alignment = { horizontal: "left", vertical: "middle", indent: 1 };
  rowGrup.getCell(2).font = { bold: true, size: 9, color: { argb: "FF64748B" } };
  styleHeaderCell(rowGrup.getCell(2), colorHeaderBg, colorIndigo);

  bulanList.forEach((b: { label: string; tahun: number; bulan: number }, idx: number) => {
    const startCol = colBulanStart + idx * colsPerBulan;
    ws.mergeCells(6, startCol, 6, startCol + colsPerBulan - 1);
    const cell = rowGrup.getCell(startCol);
    cell.value = b.label;
    cell.font = { bold: true, size: 9, color: { argb: colorIndigo } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    styleHeaderCell(cell, "FFE8E8FF", colorIndigo);
    for (let c = startCol; c < startCol + colsPerBulan; c++) {
      styleHeaderCell(rowGrup.getCell(c), "FFE8E8FF", colorIndigo);
    }
  });

  ws.mergeCells(6, colTotalS, 6, colPersen);
  const totalGrupCell = rowGrup.getCell(colTotalS);
  totalGrupCell.value = "Total Semester";
  totalGrupCell.font = { bold: true, size: 9, color: { argb: colorPurple } };
  totalGrupCell.alignment = { horizontal: "center", vertical: "middle" };
  for (let c = colTotalS; c <= colPersen; c++) {
    styleHeaderCell(rowGrup.getCell(c), "FFF0E8FF", colorPurple);
  }

  // ── Baris 7: Header S/I/A ──
  const rowSIA = ws.getRow(7);
  rowSIA.height = 16;

  bulanList.forEach((_b: { label: string; tahun: number; bulan: number }, idx: number) => {
    const startCol = colBulanStart + idx * colsPerBulan;
    const labels: [string, string, string][] = [
      ["S", colorSakitText, "FFFFF7E0"],
      ["I", colorIzinText, "FFE0EEFF"],
      ["A", colorAlpaText, "FFFEE0E0"],
    ];
    labels.forEach(([label, tc, bg], li) => {
      const cell = rowSIA.getCell(startCol + li);
      cell.value = label;
      cell.font = { bold: true, size: 9, color: { argb: tc } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      styleHeaderCell(cell, bg, colorIndigo);
    });
  });

  const totalLabels: [number, string, string, string][] = [
    [colTotalS, "S", colorSakitText, colorSakit],
    [colTotalI, "I", colorIzinText, colorIzin],
    [colTotalA, "A", colorAlpaText, colorAlpa],
    [colPersen, "%", colorIndigo, "FFE8E8FF"],
  ];
  totalLabels.forEach(([col, label, tc, bg]) => {
    const cell = rowSIA.getCell(col);
    cell.value = label;
    cell.font = { bold: true, size: 9, color: { argb: tc } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    styleHeaderCell(cell, bg, colorPurple);
  });

  // ── Baris data ──
  const dataStart = 8;
  let grandS = 0, grandI = 0, grandA = 0;

  siswaData.forEach((siswa: { nomorAbsen: number; nama: string; perBulan: Record<string, { S: number; I: number; A: number }>; totalS: number; totalI: number; totalA: number; persen: number }, idx: number) => {
    const rowNum = dataStart + idx;
    const row = ws.getRow(rowNum);
    row.height = 15;
    const bg = idx % 2 !== 0 ? colorStripe : "FFFFFFFF";

    setDataCell(row.getCell(1), siswa.nomorAbsen, bg, "FF94A3B8", false, "center");
    setDataCell(row.getCell(2), siswa.nama, bg, "FF0F172A", true, "left");

    bulanList.forEach((b: any, idx2: number) => {
      const key = `${b.tahun}-${b.bulan}`;
      const data = siswa.perBulan[key] ?? { S: 0, I: 0, A: 0 };
      const startCol = colBulanStart + idx2 * colsPerBulan;
      setDataCell(row.getCell(startCol), data.S || "–", data.S > 0 ? colorSakit : bg, data.S > 0 ? colorSakitText : "FFCBD5E1", data.S > 0, "center");
      setDataCell(row.getCell(startCol + 1), data.I || "–", data.I > 0 ? colorIzin : bg, data.I > 0 ? colorIzinText : "FFCBD5E1", data.I > 0, "center");
      setDataCell(row.getCell(startCol + 2), data.A || "–", data.A > 0 ? colorAlpa : bg, data.A > 0 ? colorAlpaText : "FFCBD5E1", data.A > 0, "center");
    });

    const pColor = siswa.persen >= 80 ? "FF059669" : siswa.persen >= 60 ? colorSakitText : colorAlpaText;
    setDataCell(row.getCell(colTotalS), siswa.totalS || "–", colorSakit, colorSakitText, siswa.totalS > 0, "center");
    setDataCell(row.getCell(colTotalI), siswa.totalI || "–", colorIzin, colorIzinText, siswa.totalI > 0, "center");
    setDataCell(row.getCell(colTotalA), siswa.totalA || "–", colorAlpa, colorAlpaText, siswa.totalA > 0, "center");
    setDataCell(row.getCell(colPersen), `${siswa.persen}%`, "FFE8E8FF", pColor, true, "center");

    grandS += siswa.totalS;
    grandI += siswa.totalI;
    grandA += siswa.totalA;
  });

  // ── Baris total ──
  const totalRowNum = dataStart + siswaData.length;
  const totalRow = ws.getRow(totalRowNum);
  totalRow.height = 16;

  ws.mergeCells(totalRowNum, 1, totalRowNum, colNama);
  const totLabelCell = totalRow.getCell(1);
  totLabelCell.value = "TOTAL";
  totLabelCell.font = { bold: true, size: 10, color: { argb: colorIndigoDark } };
  totLabelCell.alignment = { horizontal: "right", vertical: "middle" };
  styleHeaderCell(totLabelCell, colorHeaderBg, colorIndigo);

  bulanList.forEach((_b: { label: string; tahun: number; bulan: number }, idx: number) => {
    const startCol = colBulanStart + idx * colsPerBulan;
    const tS = siswaData.reduce((s: number, r: { perBulan: Record<string, { S: number; I: number; A: number }> }) => s + (r.perBulan[`${bulanList[idx].tahun}-${bulanList[idx].bulan}`]?.S ?? 0), 0);
    const tI = siswaData.reduce((s: number, r: { perBulan: Record<string, { S: number; I: number; A: number }> }) => s + (r.perBulan[`${bulanList[idx].tahun}-${bulanList[idx].bulan}`]?.I ?? 0), 0);
    const tA = siswaData.reduce((s: number, r: { perBulan: Record<string, { S: number; I: number; A: number }> }) => s + (r.perBulan[`${bulanList[idx].tahun}-${bulanList[idx].bulan}`]?.A ?? 0), 0);
    setDataCell(totalRow.getCell(startCol), tS, colorSakit, colorSakitText, true, "center");
    setDataCell(totalRow.getCell(startCol + 1), tI, colorIzin, colorIzinText, true, "center");
    setDataCell(totalRow.getCell(startCol + 2), tA, colorAlpa, colorAlpaText, true, "center");
  });

  setDataCell(totalRow.getCell(colTotalS), grandS, colorSakit, colorSakitText, true, "center");
  setDataCell(totalRow.getCell(colTotalI), grandI, colorIzin, colorIzinText, true, "center");
  setDataCell(totalRow.getCell(colTotalA), grandA, colorAlpa, colorAlpaText, true, "center");
  styleHeaderCell(totalRow.getCell(colPersen), "FFE8E8FF", colorPurple);

  // Garis atas/bawah baris total
  for (let c = 1; c <= totalCols; c++) {
    const cell = totalRow.getCell(c);
    cell.border = {
      ...cell.border,
      top: { style: "medium", color: { argb: colorIndigo } },
      bottom: { style: "medium", color: { argb: colorIndigo } },
    };
  }

  const buffer = await wb.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="Rekap_${namaKelas}_${namaSemester}.xlsx"`,
    },
  });
}

function styleHeaderCell(cell: import("exceljs").Cell, bg: string, borderColor: string) {
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
  cell.border = {
    top: { style: "thin", color: { argb: borderColor } },
    bottom: { style: "thin", color: { argb: borderColor } },
    left: { style: "hair", color: { argb: "FFE2E8F0" } },
    right: { style: "hair", color: { argb: "FFE2E8F0" } },
  };
}

function setDataCell(cell: import("exceljs").Cell, value: string | number, bg: string, textColor: string, bold: boolean, align: "center" | "left") {
  cell.value = value;
  cell.font = { size: 10, bold, color: { argb: textColor } };
  cell.alignment = { horizontal: align, vertical: "middle", indent: align === "left" ? 1 : 0 };
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
  cell.border = {
    top: { style: "hair", color: { argb: "FFE2E8F0" } },
    bottom: { style: "hair", color: { argb: "FFE2E8F0" } },
    left: { style: "hair", color: { argb: "FFE2E8F0" } },
    right: { style: "hair", color: { argb: "FFE2E8F0" } },
  };
}

/**
 * Cek apakah waktu sekarang (di zona waktu sekolah) sudah melewati jam lock.
 * jamLock format "HH:MM" (contoh "15:00"), zonaWaktu format IANA (contoh "Asia/Jakarta").
 */
export function isJamLockTerlewati(jamLock: string, zonaWaktu: string): boolean {
  const now = new Date();

  const jamSekarangStr = new Intl.DateTimeFormat("en-GB", {
    timeZone: zonaWaktu,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);

  const [jamSekarang, menitSekarang] = jamSekarangStr.split(":").map(Number);
  const [jamLockH, jamLockM] = jamLock.split(":").map(Number);

  const totalMenitSekarang = jamSekarang * 60 + menitSekarang;
  const totalMenitLock = jamLockH * 60 + jamLockM;

  return totalMenitSekarang >= totalMenitLock;
}

/**
 * Ambil tanggal hari ini (tanpa waktu) di zona waktu sekolah, untuk dipakai
 * sebagai filter kolom `tanggal` (@db.Date) pada tabel Absensi.
 */
export function getTanggalHariIni(zonaWaktu: string): Date {
  const now = new Date();
  const tanggalStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: zonaWaktu,
  }).format(now); // format: YYYY-MM-DD

  return new Date(`${tanggalStr}T00:00:00.000Z`);
}

# PROMPT HANDOFF — absenku by KiharuWorks

Kamu adalah asisten developer untuk proyek **absenku**, aplikasi SaaS absensi sekolah berbasis web.
Minta konfirmasi dulu sebelum mengerjakan sesuatu. Jangan langsung eksekusi tanpa persetujuan user.

---

## Identitas Proyek

- **Nama aplikasi**: absenku
- **Branding**: by KiharuWorks (tampil di UI, bukan nama domain/folder)
- **Tujuan**: Aplikasi SaaS absensi harian sekolah, dijual ke sekolah-sekolah
- **Status**: MVP — sedang ditest di sekolah tempat developer bekerja sebelum dijual ke sekolah lain

---

## Stack Teknologi

- **Framework**: Next.js (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **ORM**: Prisma v7
- **Database**: PostgreSQL via Neon (cloud, free tier)
- **Hosting**: Vercel (free tier, nanti upgrade kalau sudah banyak sekolah)
- **Lokasi project**: `C:\Users\HARU\Desktop\absenku`

---

## Yang Sudah Dikerjakan

1. ✅ Project Next.js di-init dengan App Router + TypeScript + Tailwind + ESLint
2. ✅ Prisma v7 terinstall dan di-init (`prisma.config.ts` sudah ada)
3. ✅ Database Neon sudah dibuat (region: AWS Asia Pacific - Singapore)
4. ✅ `schema.prisma` lengkap sudah dibuat dan di-migrate ke Neon (`npx prisma migrate dev --name init`)
5. ✅ Semua tabel sudah terbuat di database

## Yang Belum Dikerjakan

- [ ] Install library tambahan (NextAuth, bcrypt, dll)
- [ ] Setup Auth (sistem login multi-role)
- [ ] Struktur folder & routes per role
- [ ] UI/halaman apapun
- [ ] Logic bisnis apapun

---

## Skema Database (Prisma)

Tabel yang sudah ada di database:

| Tabel | Keterangan |
|---|---|
| `sekolah` | Data sekolah, multi-tenant |
| `langganan` | Status & periode langganan per sekolah |
| `konfigurasi_sekolah` | Jam lock absensi, batas alpa, zona waktu |
| `user` | Semua user (Developer, Admin, Sekretaris, Wali Kelas) |
| `sekretaris` | Relasi user ↔ kelas (1 sekretaris = 1 kelas) |
| `kelas` | Daftar kelas per sekolah |
| `siswa` | Data siswa + flag isActive |
| `siswa_kelas` | Histori siswa di kelas (preserve saat pindah kelas) |
| `tahun_ajaran` | Tahun ajaran per sekolah |
| `semester` | Semester (Ganjil/Genap) dengan rentang tanggal |
| `hari_libur` | Hari libur per sekolah |
| `absensi` | Record H/S/I/A per siswa per hari |

### Enum
- `Role`: DEVELOPER, ADMIN_SEKOLAH, SEKRETARIS, WALI_KELAS
- `StatusAbsensi`: H, S, I, A
- `StatusLangganan`: AKTIF, EXPIRED, NONAKTIF

---

## Arsitektur User (4 Level)

### 1. Developer (super admin)
- Daftarkan sekolah baru (manual dulu)
- Monitor & kelola status langganan per sekolah
- Nonaktifkan/aktifkan akun sekolah

### 2. Admin Sekolah
- Kelola kelas, siswa, hari libur, semester, jam lock
- Lihat semua rekap & export
- Reset password sekretaris
- Bisa edit absensi tanggal apapun (bypass jam lock)

### 3. Sekretaris Kelas
- 1 akun terikat ke 1 kelas (ditentukan admin)
- Input absensi harian (hanya hari ini, sebelum jam lock)
- Lihat rekap kelasnya
- Download form cetak PDF
- Ganti password sendiri

### 4. Wali Kelas (fase berikutnya)
- Lihat rekap kelasnya saja, tidak bisa edit

---

## Scope MVP (Fitur yang Harus Ada)

### Absensi
- Status: H (Hadir), S (Sakit), I (Izin), A (Alpa)
- Absensi harian saja (bukan per jam pelajaran)
- Sistem hybrid: kertas + digital paralel
- Sekretaris hanya bisa input/edit hari ini, sebelum jam lock
- Admin bisa edit tanggal apapun kapan saja

### Jam Lock
- Dikonfigurasi admin per sekolah (misal 15:00 WIB)
- Setelah jam lock, sekretaris tidak bisa input/edit
- Admin bypass lock

### Manajemen Siswa
- Tambah individual (form)
- Import bulk via Excel (template download → isi → upload)
- Nonaktifkan siswa (tidak muncul di form, data lama tersimpan)
- Pindah kelas: data absensi lama tetap di kelas lama

### Setup Awal Sekolah
1. Admin buat kelas dulu
2. Admin download template Excel (berisi daftar kelas)
3. Admin isi data siswa di Excel
4. Admin upload → sistem import, error per baris dilaporkan

### Rekap & Export
- **Rekap bulanan**: grid baris=siswa, kolom=tanggal, warna per status (S=pink, I=biru, A=merah, libur=abu)
- **Rekap semester**: ringkasan per bulan
- **Export Excel**: format sama dengan tampilan layar + warna
- **PDF cetak**: format F4, layout mingguan, header otomatis

### Dashboard Admin
- Kelas mana yang sudah/belum input hari ini
- Persentase kehadiran minggu ini
- Siswa dengan Alpa terbanyak bulan ini

### Laporan Siswa Bermasalah
- Filter siswa yang Alpa melebihi batas (dikonfigurasi admin)

### Keamanan Akun
- Sekretaris & admin bisa ganti password sendiri
- Admin bisa reset password sekretaris (tanpa email service di MVP)

---

## Model Bisnis

- **Langsung berbayar** dari awal, tidak ada trial
- **Fase awal**: onboarding manual — sekolah hubungi Developer, Developer buat akun admin sekolah, konfirmasi pembayaran manual
- **Fase berikutnya**: self-service — sekolah daftar & bayar sendiri, akun otomatis aktif
- **Retensi data**: data sekolah yang berhenti berlangganan disimpan X hari sebelum dihapus (belum ditentukan)
- Sekolah bisa export semua data kapan saja sebelum berhenti

---

## Fitur Fase Berikutnya (Belum Dikerjakan di MVP)

- Wali kelas (role ke-4)
- Multi-admin per sekolah
- Self-service onboarding & pembayaran
- Notifikasi/reminder ke sekretaris (PWA / WhatsApp / email)
- Log aktivitas (audit trail)
- PWA (Progressive Web App)

---

## Catatan Teknis Penting

- **Multi-tenant dari awal**: setiap data terikat ke `sekolahId`
- **Prisma v7**: konfigurasi koneksi di `prisma.config.ts`, bukan di `schema.prisma`
- **`prisma.config.ts`** sudah ada dan terhubung ke `DATABASE_URL` di `.env`
- **`.env`** sudah berisi connection string Neon (jangan di-commit ke Git)
- **Zona waktu**: disimpan di `konfigurasi_sekolah.zonaWaktu`, default `Asia/Jakarta`
- **Jam lock** disimpan sebagai string `HH:mm` di `konfigurasi_sekolah.jamLock`
- Siswa pindah kelas: gunakan tabel `siswa_kelas` (set `tanggalKeluar`, buat record baru)

---

## Instruksi untuk Claude

1. Selalu minta konfirmasi sebelum mengerjakan sesuatu
2. Jangan langsung jalankan perintah tanpa persetujuan user
3. Kalau ada keputusan arsitektur baru, catat di prompt ini
4. User bernama **Haru** (dari KiharuWorks)
5. Bahasa komunikasi: **Bahasa Indonesia**
6. Lanjutkan dari bagian **"Yang Belum Dikerjakan"** di atas
7. Urutan yang disarankan berikutnya:
   - Install library tambahan (NextAuth, bcrypt, dll)
   - Setup Auth (sistem login multi-role)
   - Struktur folder & routes per role

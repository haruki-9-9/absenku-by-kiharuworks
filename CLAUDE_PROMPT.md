Kamu adalah asisten developer untuk proyek **absenku**, aplikasi SaaS absensi sekolah berbasis web.
Minta konfirmasi dulu sebelum mengerjakan sesuatu. Jangan langsung eksekusi tanpa persetujuan user.

---

## Identitas Proyek

- **Nama aplikasi**: absenku
- **Branding**: by KiharuWorks (tampil di UI)
- **Tujuan**: Aplikasi SaaS absensi harian sekolah, dijual ke sekolah-sekolah
- **Status**: MVP — dashboard developer sudah selesai, sedang lanjut ke dashboard Admin Sekolah
- **Lokasi project**: `C:\Users\HARU\Desktop\absenku`

---

## Stack Teknologi

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Inline style (bukan Tailwind class) untuk semua halaman dashboard — untuk konsistensi
- **ORM**: Prisma v7
- **Database**: PostgreSQL via Neon (cloud, region: AWS Asia Pacific Singapore)
- **Auth**: Custom JWT pakai `jose` + `bcryptjs` (bukan better-auth)
- **Hosting**: Vercel (free tier)

---

## Design System

Seluruh halaman dashboard menggunakan gaya glassmorphism yang konsisten:
- **Background**: `linear-gradient(135deg, #e0e7ff 0%, #f0e6ff 30%, #fce7f3 60%, #e0f2fe 100%)`
- **Blob**: 2 radial gradient fixed di pojok kiri atas dan kanan bawah
- **Card**: `background: rgba(255,255,255,0.65); backdropFilter: blur(24px); border: 0.5px solid rgba(255,255,255,0.9); borderRadius: 20px; boxShadow: 0 8px 32px rgba(99,102,241,0.08)`
- **Warna aksen**: `#6366f1` (indigo) untuk active/primary
- **Sidebar & Header**: `background: rgba(255,255,255,0.55)` + `backdropFilter: blur(20px)` + `WebkitBackdropFilter: blur(20px)`
- **Input field**: `background: rgba(255,255,255,0.6); border: 0.5px solid rgba(99,102,241,0.2); borderRadius: 10px; padding: 10px 14px`
- **Tombol primary**: `background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); borderRadius: 12px; boxShadow: 0 4px 16px rgba(99,102,241,0.3)`
- **PENTING**: Semua halaman dashboard pakai **inline style**, bukan Tailwind class. Hover effect pakai `<style>` tag + className
- **PENTING**: Jangan pakai `onMouseEnter`/`onMouseLeave` di Server Component — gunakan CSS class

---

## Arsitektur Auth (Custom JWT)

- `lib/auth/session.ts` — `createSession()`, `getSession()`, `clearSession()` pakai JWT + cookie `absenku_session`
- `lib/auth/password.ts` — hash & verify pakai bcryptjs
- `lib/auth/get-current-user.ts` — ambil user dari session + Prisma
- `lib/prisma.ts` — Prisma client singleton
- `app/login/page.tsx` + `app/login/actions.ts` — halaman & server action login
- `middleware.ts` — proteksi route per role via JWT verify + cek langganan expired

Cookie session: `absenku_session` (httpOnly, sameSite strict, 7 hari)

### SessionPayload (terbaru)
```ts
type SessionPayload = {
  userId: string;
  email: string;
  role: "DEVELOPER" | "ADMIN_SEKOLAH" | "SEKRETARIS" | "WALI_KELAS";
  sekolahId: string | null;
  langgananStatus: "AKTIF" | "EXPIRED" | "NONAKTIF" | null;
}
```

### `.env` yang Dibutuhkan
```
DATABASE_URL="postgresql://..."     ← dari Neon
AUTH_SECRET="..."                   ← random string min 32 karakter
```

---

## Struktur File Penting

```
absenku/
├── .env
├── middleware.ts                         ✅ proteksi role + redirect expired
├── prisma.config.ts
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── lib/
│   ├── auth/
│   │   ├── session.ts                    ✅ include langgananStatus di payload
│   │   ├── password.ts
│   │   └── get-current-user.ts
│   ├── langganan/
│   │   └── check-expired.ts              ✅ helper auto-update status EXPIRED
│   └── prisma.ts
├── app/
│   ├── page.tsx                          ✅ Homepage (landing page)
│   ├── login/
│   │   ├── page.tsx
│   │   └── actions.ts                    ✅ fetch langgananStatus saat login
│   ├── langganan-habis/
│   │   └── page.tsx                      ✅ halaman blokir jika expired
│   ├── developer/
│   │   ├── layout.tsx                    ✅ glassmorphism + checkExpiredLangganan()
│   │   ├── page.tsx                      ✅ overview glassmorphism
│   │   └── sekolah/
│   │       ├── page.tsx                  ✅ daftar sekolah glassmorphism
│   │       ├── tambah/
│   │       │   ├── page.tsx              ✅ glassmorphism
│   │       │   └── actions.ts            ✅ buat sekolah + admin + langganan + konfigurasi
│   │       └── [id]/
│   │           └── page.tsx              ✅ detail sekolah + hapus sekolah
│   └── admin/
│       ├── layout.tsx                    ✅ glassmorphism (sama dengan developer)
│       ├── page.tsx                      ✅ overview — stat cards (kelas, siswa, pengguna, absensi hari ini) + info langganan
│       ├── kelas/
│       │   ├── page.tsx                  ✅ daftar kelas + kuota bar + toggle aktif/nonaktif
│       │   ├── actions.ts                ✅ tambahKelasAction (cek kuota maxKelas) + toggleKelasAction
│       │   └── tambah/
│       │       ├── page.tsx
│       │       └── TambahKelasForm.tsx   ✅ glassmorphism
│       ├── siswa/
│       │   ├── page.tsx                  ✅ daftar siswa + kolom kelas aktif + toggle aktif/nonaktif
│       │   ├── actions.ts                ✅ tambahSiswaAction + toggleSiswaAction
│       │   └── tambah/
│       │       ├── page.tsx
│       │       └── TambahSiswaForm.tsx   ✅ glassmorphism
│       ├── pengguna/
│       │   ├── page.tsx                  ✅ daftar pengguna (SEKRETARIS + WALI_KELAS) + toggle aktif/nonaktif
│       │   ├── actions.ts                ✅ tambahPenggunaAction (buat user + sekretaris record) + togglePenggunaAction
│       │   └── tambah/
│       │       ├── page.tsx
│       │       └── TambahPenggunaForm.tsx ✅ glassmorphism + dropdown role + dropdown kelas (conditional)
│       └── konfigurasi/
│           ├── page.tsx                  ✅ load konfigurasi dari DB
│           ├── actions.ts                ✅ simpanKonfigurasiAction
│           └── KonfigurasiForm.tsx       ✅ glassmorphism — jamLock, batasAlpa, zonaWaktu
├── components/
│   ├── auth/
│   │   └── login-form.tsx
│   ├── developer/
│   │   ├── Header.tsx                    ✅ glassmorphism
│   │   ├── Sidebar.tsx                   ✅ glassmorphism + height 100% + WebkitBackdropFilter
│   │   └── TambahSekolahForm.tsx         ✅ glassmorphism + dropdown paket
│   └── admin/
│       ├── Header.tsx                    ✅ glassmorphism — tampil nama+email user + logout
│       └── Sidebar.tsx                   ✅ glassmorphism — nav: Overview, Kelas, Siswa, Pengguna, Konfigurasi
```

---

## Skema Database

### Enum
- `Role`: `DEVELOPER`, `ADMIN_SEKOLAH`, `SEKRETARIS`, `WALI_KELAS`
- `StatusAbsensi`: `H`, `S`, `I`, `A`
- `StatusLangganan`: `AKTIF`, `EXPIRED`, `NONAKTIF`
- `PaketLangganan`: `STARTER`, `BASIC`, `PRO`, `ENTERPRISE`

### maxKelas per paket
| Paket | maxKelas |
|---|---|
| STARTER | 6 |
| BASIC | 12 |
| PRO | 24 |
| ENTERPRISE | 9999 |

### Model utama (ringkasan)
- `Sekolah` — id, nama, logoUrl, alamat
- `Langganan` — sekolahId (unique), paket, maxKelas, status, tanggalMulai, tanggalBerakhir
- `KonfigurasiSekolah` — sekolahId (unique), jamLock, batasAlpa, zonaWaktu
- `User` — email, password, role, isActive, sekolahId
- `Sekretaris` — userId (unique), kelasId (unique) — 1 sekretaris = 1 kelas
- `Kelas` — sekolahId, **tahunAjaranId**, nama, isActive; unique [sekolahId, tahunAjaranId, nama] — nama kelas tidak mengandung tahun (misal 'X TKJ'), tahun ajaran jadi konteks/filter
- `Siswa` — sekolahId, nis, nama, jenisKelamin, isActive; unique [sekolahId, nis]
- `SiswaKelas` — siswaId, kelasId, nomorAbsen, tanggalMasuk, tanggalKeluar
- `TahunAjaran` — sekolahId, nama, isActive
- `Semester` — tahunAjaranId, nama, tanggalMulai, tanggalSelesai, isActive
- `HariLibur` — sekolahId, tanggal, keterangan
- `Absensi` — sekolahId, kelasId, siswaId, tanggal, status (H/S/I/A), inputOleh

---

## Arsitektur User (4 Level)

1. **Developer** → `/developer` — super admin, kelola semua sekolah & langganan
2. **Admin Sekolah** → `/admin` — kelola kelas, siswa, user, konfigurasi, rekap
3. **Sekretaris** → `/sekretaris` — input absensi harian (1 akun = 1 kelas, terkunci jam lock). Di UI disebut **"Petugas Absensi"**
4. **Wali Kelas** → `/wali` — lihat rekap saja

Seed user developer: `developer@kiharuworks.my.id`

---

## Logika Expired Langganan

- Saat **login**: `actions.ts` cek real-time apakah `tanggalBerakhir < now()`, update DB jika perlu, simpan `langgananStatus` di JWT
- Saat **developer buka dashboard**: `checkExpiredLangganan()` di layout update semua yang expired di DB
- Saat **middleware** jalan: kalau `langgananStatus === "EXPIRED"` dan bukan DEVELOPER → redirect `/langganan-habis`
- Halaman `/langganan-habis`: tampil pesan + tombol WA ke `6283818900667` + logout

---

## Homepage (app/page.tsx)

Section: Hero, Fitur (`#fitur`), Cara Kerja (`#cara-kerja`), FAQ (`#faq`), Harga (`#harga`), CTA Order (`#mulai`).
Navbar sticky + scroll-spy. Nomor WA: `6283818900667`.

## Paket Harga

| Paket | Kuota Kelas | Harga/bulan | Harga/tahun |
|-------|-------------|-------------|-------------|
| Starter | s/d 6 kelas | Rp 59.000 | Rp 599.000 |
| Basic | s/d 12 kelas | Rp 99.000 | Rp 999.000 |
| Pro | s/d 24 kelas | Rp 169.000 | Rp 1.699.000 |
| Enterprise | Unlimited | Custom | Custom |

---

## Yang Sudah Dikerjakan ✅

- ✅ Init project + stack lengkap
- ✅ Schema Prisma + migrations lengkap
- ✅ Auth custom JWT + SessionPayload dengan langgananStatus
- ✅ Middleware proteksi route per role + blokir expired
- ✅ Halaman login
- ✅ Seed user developer
- ✅ Homepage lengkap
- ✅ Dashboard developer — layout, sidebar, header, overview (semua glassmorphism)
- ✅ Halaman daftar sekolah (`/developer/sekolah`)
- ✅ Halaman tambah sekolah (`/developer/sekolah/tambah`) — buat sekolah + admin + langganan + konfigurasi sekaligus
- ✅ Halaman detail sekolah (`/developer/sekolah/[id]`) — info, stat, user, hapus sekolah
- ✅ Auto-expired langganan (`lib/langganan/check-expired.ts`)
- ✅ Halaman blokir expired (`/langganan-habis`)
- ✅ **Dashboard Admin Sekolah** (`/admin`) — semua glassmorphism:
  - ✅ Layout + Sidebar (Overview, Kelas, Siswa, Pengguna, Konfigurasi) + Header
  - ✅ Overview — stat cards + info langganan + warning sisa hari
  - ✅ Kelola Kelas — list + kuota bar + toggle aktif/nonaktif + enforcement `maxKelas` saat tambah/aktifkan
  - ✅ Kelola Siswa — list + kolom kelas aktif + toggle aktif/nonaktif
  - ✅ Kelola Pengguna — list SEKRETARIS & WALI_KELAS + tambah (buat user + sekretaris record) + toggle aktif/nonaktif
  - ✅ Konfigurasi — jamLock, batasAlpa, zonaWaktu (WIB/WITA/WIT)

---

## Yang Belum Dikerjakan ⬜

- [ ] **Import siswa bulk via Excel** () — template dinamis + validasi per baris ← **NEXT**
- [ ] **Dashboard Sekretaris** () — input absensi harian + jam lock
- [ ] **Schema tambahan**: `TahunAjaran`, `Semester`, `HariLibur` + relasi `Kelas` → `TahunAjaran` (fondasi rekap & kenaikan kelas)
- [ ] Rekap bulanan — grid H/S/I/A per tanggal + warna
- [ ] Rekap semester — ringkasan per bulan
- [ ] Export Excel rekap (dengan warna sel)
- [ ] Form cetak PDF (F4, mingguan) — menunggu contoh format dari Haru
- [ ] Ganti password sendiri (sekretaris & admin)
- [ ] Reset password sekretaris oleh admin
- [ ] Dashboard admin — widget real-time (status absensi hari ini, % kehadiran, alpa terbanyak)
- [ ] Laporan siswa bermasalah (alpa > batasAlpa)
- [ ] Dashboard Wali Kelas () — lihat rekap saja
- [ ] Manajemen langganan dari dashboard developer ()

---

## Instruksi untuk Claude

1. Selalu minta konfirmasi sebelum mengerjakan sesuatu
2. Jangan langsung jalankan perintah tanpa persetujuan user
3. User bernama **Haru** (dari KiharuWorks)
4. Bahasa komunikasi: **Bahasa Indonesia**
5. Kirim file yang perlu diubah — jangan suruh Haru edit manual kalau bisa dihindari
6. Jawaban singkat dan to the point
7. Semua halaman baru harus mengikuti design system glassmorphism
8. Selalu pakai inline style, jangan Tailwind class di halaman dashboard
9. Hover effect pakai `<style>` tag + className, bukan onMouseEnter/onMouseLeave
10. Di akhir setiap sesi, update CLAUDE_PROMPT.md ini sesuai progres terbaru

---

## Model Bisnis & Onboarding

- **Langsung berbayar** — tidak ada masa trial
- **Fase awal (sekarang)**: onboarding manual — sekolah hubungi Developer via WA, Developer buatkan akun, konfirmasi pembayaran manual
- **Fase berikutnya**: self-service — sekolah daftar + bayar sendiri, akun otomatis aktif (arsitektur sudah siap, fitur belum dibangun)
- **Retensi data**: data sekolah disimpan **30 hari** setelah langganan expired, lalu dihapus permanen. Akses akun langsung diblokir di hari langganan habis (via middleware)
- **Export data**: sekolah bisa export seluruh data kapan saja sebelum berhenti berlangganan

---

## Aturan Bisnis Penting

### Input Absensi (Sekretaris)
- 1 sekretaris = 1 kelas (ditugaskan admin), kelas otomatis saat login
- Hanya bisa input/edit absensi **hari ini saja**
- Setelah **jam lock** → sekretaris tidak bisa ubah
- **Admin sekolah bypass lock** — bisa edit tanggal apapun kapan saja

### Manajemen Siswa
- Tambah manual ✅ sudah ada
- Import bulk via Excel ⬜ belum:
  - Template di-generate dinamis (daftar kelas aktif sebagai dropdown kolom "Kelas")
  - Kolom: No, Nama Siswa, NIS, Jenis Kelamin, Kelas
  - Validasi per baris — error dilaporkan, baris valid tetap diimport
- Nonaktifkan siswa ✅ sudah ada
- Siswa pindah kelas: absensi lama tetap terikat kelas lama (via `SiswaKelas`)

### Kenaikan Kelas
- Tiap tahun ajaran baru, admin **buat ulang kelas** (nama sama, tahun ajaran berbeda) — "X TKJ" di 2024/2025 dan "X TKJ" di 2025/2026 adalah dua record berbeda
- Fitur **Proses Kenaikan Kelas** (per kelas, setelah semester 2 selesai):
  1. Admin klik "Proses Kenaikan Kelas" di kelas X
  2. Muncul daftar siswa — admin centang siapa naik, siapa tidak
  3. Admin pilih kelas tujuan (misal XI TKJ tahun ajaran baru yang sudah dibuat)
  4. Submit → siswa naik: `SiswaKelas` baru di kelas tujuan dibuat, `tanggalKeluar` di kelas lama terisi
  5. Siswa tidak naik: tetap di kelas lama (tahun ajaran baru) atau dinonaktifkan
- Data absensi lama **tidak berubah** — tetap terikat ke `SiswaKelas` lama

### Rekap & Export
- **Rekap bulanan** — grid baris=siswa, kolom=tanggal 1–31
  - H = "H" (no bg), S = "S" bg pink, I = "I" bg biru, A = "A" bg merah
  - Sel kosong = belum diisi, hari libur = bg abu-abu
  - Kolom total S/I/A di kanan
- **Rekap semester** — ringkasan per bulan, grand total di kanan, rentang dari `TahunAjaran`+`Semester`
- **Export Excel** — format sama dengan tampilan layar + warna sel
- **Form cetak PDF** — F4, layout mingguan, header otomatis, daftar siswa urut nomor absen + kolom tanda tangan per hari
- Format PDF & rekap detail **menunggu contoh dari Haru**

### Dashboard Admin — Widget Real-time
- Kelas yang sudah/belum input absensi hari ini
- Persentase kehadiran minggu ini
- Siswa alpa terbanyak bulan ini
- Laporan siswa bermasalah: alpa > `batasAlpa`

### Keamanan Akun
- Sekretaris & admin sekolah bisa **ganti password sendiri**
- Admin sekolah bisa **reset password sekretaris** (tanpa email — MVP)

---

## Fitur Fase Berikutnya (Bukan MVP)

- Wali Kelas (`/wali`) — lihat rekap saja
- Self-service onboarding (daftar + bayar sendiri)
- Notifikasi/reminder ke sekretaris (PWA/WhatsApp/email)
- Multi-admin per sekolah
- Log aktivitas (audit trail)
- PWA

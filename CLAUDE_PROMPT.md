Kamu adalah asisten developer untuk proyek **absenku**, aplikasi SaaS absensi sekolah berbasis web.
Minta konfirmasi dulu sebelum mengerjakan sesuatu. Jangan langsung eksekusi tanpa persetujuan user.

---

## Identitas Proyek

- **Nama aplikasi**: absenku
- **Branding**: by KiharuWorks (tampil di UI)
- **Tujuan**: Aplikasi SaaS absensi harian sekolah, dijual ke sekolah-sekolah
- **Status**: MVP — hampir selesai. Semua fitur Developer, Admin, dan Sekretaris sudah selesai. Satu-satunya yang belum: dashboard Wali Kelas (`/wali`)
- **Lokasi project**: `C:\Users\HARU\Desktop\absenku`

---

## Stack Teknologi

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Inline style (bukan Tailwind class) untuk semua halaman dashboard — untuk konsistensi
- **ORM**: Prisma v7
- **Database**: PostgreSQL via Neon (cloud, region: AWS Asia Pacific Singapore)
- **Auth**: Custom JWT pakai `jose` + `bcryptjs` (bukan better-auth, bukan next-auth)
- **Export Excel**: `exceljs` ^4.4.0
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

### SessionPayload
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
│   └── migrations/                       ✅ 4 migrasi sudah jalan
├── lib/
│   ├── auth/
│   │   ├── session.ts                    ✅ JWT + cookie absenku_session
│   │   ├── password.ts                   ✅ bcryptjs
│   │   └── get-current-user.ts
│   ├── langganan/
│   │   └── check-expired.ts              ✅ helper auto-update status EXPIRED
│   ├── sekretaris/
│   │   └── check-jam-lock.ts             ✅ isJamLockTerlewati() + getTanggalHariIni()
│   └── prisma.ts
├── app/
│   ├── page.tsx                          ✅ Homepage (landing page, ~49KB)
│   ├── login/
│   │   ├── page.tsx
│   │   └── actions.ts                    ✅ loginAction + logoutAction
│   ├── langganan-habis/
│   │   └── page.tsx                      ✅ halaman blokir jika expired
│   ├── developer/
│   │   ├── layout.tsx                    ✅ glassmorphism + checkExpiredLangganan()
│   │   ├── page.tsx                      ✅ overview glassmorphism
│   │   └── sekolah/
│   │       ├── page.tsx                  ✅ daftar sekolah
│   │       ├── tambah/
│   │       │   ├── page.tsx
│   │       │   └── actions.ts            ✅ buat sekolah + admin + langganan + konfigurasi
│   │       └── [id]/
│   │           └── page.tsx              ✅ detail sekolah + hapus sekolah
│   ├── admin/
│   │   ├── layout.tsx                    ✅ glassmorphism
│   │   ├── page.tsx                      ✅ overview — stat cards + info langganan + warning sisa hari
│   │   ├── kelas/
│   │   │   ├── page.tsx                  ✅ daftar kelas + kuota bar + toggle aktif/nonaktif
│   │   │   ├── actions.ts
│   │   │   └── tambah/
│   │   │       ├── page.tsx              ✅ async server component, fetch tahunAjaranList
│   │   │       └── TambahKelasForm.tsx
│   │   ├── siswa/
│   │   │   ├── page.tsx                  ✅ daftar siswa + kolom kelas aktif + toggle
│   │   │   ├── actions.ts
│   │   │   ├── tambah/
│   │   │   │   ├── page.tsx
│   │   │   │   └── TambahSiswaForm.tsx
│   │   │   └── import/
│   │   │       ├── page.tsx
│   │   │       ├── actions.ts            ✅ generateTemplateAction + importSiswaAction
│   │   │       └── ImportSiswaForm.tsx   ✅ download template + upload + hasil import
│   │   ├── pengguna/
│   │   │   ├── page.tsx                  ✅ daftar pengguna + toggle aktif/nonaktif
│   │   │   ├── actions.ts                ✅ tambahPenggunaAction + togglePenggunaAction
│   │   │   └── tambah/
│   │   │       ├── page.tsx
│   │   │       └── TambahPenggunaForm.tsx ✅ dropdown role + dropdown kelas (conditional)
│   │   ├── konfigurasi/
│   │   │   ├── page.tsx
│   │   │   ├── actions.ts
│   │   │   └── KonfigurasiForm.tsx       ✅ jamLock, batasAlpa, zonaWaktu
│   │   ├── tahun-ajaran/
│   │   │   ├── page.tsx                  ✅ list TahunAjaran + Semester + toggle aktif
│   │   │   ├── actions.ts
│   │   │   └── tambah/
│   │   │       ├── page.tsx
│   │   │       └── TambahTahunAjaranForm.tsx
│   │   └── rekap/
│   │       ├── page.tsx                  ✅ halaman pilih kelas + jenis rekap (bulanan/semester)
│   │       ├── bulanan/
│   │       │   ├── page.tsx              ✅ server component fetch data
│   │       │   └── RekapBulananClient.tsx ✅ grid siswa×tanggal, warna H/S/I/A, cetak PDF, download Excel
│   │       └── semester/
│   │           ├── page.tsx              ✅ server component fetch data
│   │           └── RekapSemesterClient.tsx ✅ ringkasan S/I/A per bulan, total semester
│   ├── api/
│   │   └── rekap/
│   │       ├── kelas/route.ts            ✅ GET kelas aktif milik sekolah
│   │       ├── tahun-ajaran/route.ts     ✅ GET tahun ajaran + semester milik sekolah
│   │       └── excel/
│   │           ├── bulanan/route.ts      ✅ generate .xlsx rekap bulanan (exceljs)
│   │           └── semester/route.ts     ✅ generate .xlsx rekap semester (exceljs)
│   └── sekretaris/
│       ├── layout.tsx                    ✅ glassmorphism
│       ├── page.tsx                      ✅ fetch kelas + siswa + absensi hari ini + status jam lock
│       ├── actions.ts                    ✅ setStatusAbsensiAction (upsert + validasi jam lock)
│       └── AbsensiList.tsx               ✅ client component — tombol cepat H/S/I/A + keterangan inline
├── components/
│   ├── auth/
│   │   └── login-form.tsx
│   ├── developer/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── TambahSekolahForm.tsx
│   ├── admin/
│   │   ├── Header.tsx                    ✅ tampil nama+email user + logout
│   │   └── Sidebar.tsx                   ✅ nav: Overview, Kelas, Siswa, Pengguna, Tahun Ajaran, Konfigurasi, Rekap
│   └── sekretaris/
│       └── Sidebar.tsx                   ✅ 1 menu: Absensi Hari Ini, footer "Petugas Absensi"
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
- `User` — email, password, role, isActive, sekolahId (+ field better-auth: name, emailVerified, image, sessions, accounts — tidak dipakai tapi ada di schema)
- `Sekretaris` — userId (unique), kelasId (unique) — 1 sekretaris = 1 kelas
- `Kelas` — sekolahId, tahunAjaranId, nama, isActive; unique [sekolahId, tahunAjaranId, nama]
- `Siswa` — sekolahId, nis, nama, jenisKelamin, isActive; unique [sekolahId, nis]
- `SiswaKelas` — siswaId, kelasId, nomorAbsen, tanggalMasuk, tanggalKeluar
- `TahunAjaran` — sekolahId, nama, isActive
- `Semester` — tahunAjaranId, nama, tanggalMulai, tanggalSelesai, isActive
- `HariLibur` — sekolahId, tanggal, keterangan
- `Absensi` — sekolahId, kelasId, siswaId, tanggal, status (H/S/I/A), inputOleh; unique [siswaId, tanggal]

**Catatan schema**: Masih ada tabel sisa better-auth (`Session`, `Account`, `Verification`) di schema.prisma dan database. Tidak dipakai oleh kode apapun, tapi dibiarkan karena migrasi sudah jalan dan tidak mengganggu.

---

## Arsitektur User (4 Level)

1. **Developer** → `/developer` — super admin, kelola semua sekolah & langganan
2. **Admin Sekolah** → `/admin` — kelola kelas, siswa, user, konfigurasi, rekap
3. **Sekretaris** → `/sekretaris` — input absensi harian (1 akun = 1 kelas, terkunci jam lock). Di UI disebut **"Petugas Absensi"**
4. **Wali Kelas** → `/wali` — lihat rekap saja (**belum diimplementasi**)

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
- ✅ Schema Prisma + 4 migrasi sudah jalan
- ✅ Auth custom JWT + SessionPayload dengan langgananStatus
- ✅ Middleware proteksi route per role + blokir expired
- ✅ Halaman login
- ✅ Seed user developer
- ✅ Homepage lengkap
- ✅ Dashboard Developer — layout, sidebar, header, overview (glassmorphism)
- ✅ Halaman daftar sekolah (`/developer/sekolah`)
- ✅ Halaman tambah sekolah — buat sekolah + admin + langganan + konfigurasi sekaligus
- ✅ Halaman detail sekolah (`/developer/sekolah/[id]`) — info, stat, user, hapus sekolah
- ✅ Auto-expired langganan (`lib/langganan/check-expired.ts`)
- ✅ Halaman blokir expired (`/langganan-habis`)
- ✅ Dashboard Admin Sekolah (`/admin`) — semua glassmorphism:
  - ✅ Layout + Sidebar + Header
  - ✅ Overview — stat cards + info langganan + warning sisa hari
  - ✅ Kelola Kelas — list + kuota bar + toggle aktif/nonaktif + enforcement `maxKelas`
  - ✅ Kelola Siswa — list + kolom kelas aktif + toggle aktif/nonaktif
  - ✅ Import siswa bulk via Excel (exceljs) — download template + upload + hasil import
  - ✅ Kelola Pengguna — list SEKRETARIS & WALI_KELAS + tambah + toggle aktif/nonaktif
  - ✅ Tahun Ajaran & Semester — list + toggle aktif
  - ✅ Konfigurasi — jamLock, batasAlpa, zonaWaktu (WIB/WITA/WIT)
  - ✅ **Rekap Bulanan** — grid siswa×tanggal, kode H/S/I/A berwarna, kolom ringkasan, cetak PDF (window.print()), download Excel
  - ✅ **Rekap Semester** — ringkasan S/I/A per bulan per siswa + total semester, cetak PDF, download Excel
- ✅ Dashboard Sekretaris (`/sekretaris`) — input absensi harian, jam lock, timezone-aware

---

## Yang Belum Dikerjakan ⬜

- [ ] **Dashboard Wali Kelas (`/wali`)** — lihat rekap kelas sendiri saja ← **NEXT**
- [ ] **`HariLibur`** — model ada di schema dan sudah dipakai di logika rekap (sel abu-abu), tapi belum ada UI manajemen hari libur di dashboard admin
- [ ] Dashboard admin — widget real-time (status absensi hari ini per kelas, % kehadiran, alpa terbanyak)
- [ ] Laporan siswa bermasalah (alpa > batasAlpa)
- [ ] Ganti password sendiri (sekretaris & admin)
- [ ] Reset password sekretaris oleh admin
- [ ] Manajemen langganan dari dashboard developer (perpanjang, ganti paket)
- [ ] Fitur Proses Kenaikan Kelas

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
- **Retensi data**: data sekolah disimpan **30 hari** setelah langganan expired, lalu dihapus permanen
- **Export data**: sekolah bisa export seluruh data kapan saja sebelum berhenti berlangganan

---

## Aturan Bisnis Penting

### Input Absensi (Sekretaris) ✅ SELESAI
- 1 sekretaris = 1 kelas (ditugaskan admin), kelas otomatis saat login
- Hanya bisa input/edit absensi **hari ini saja**
- Setelah **jam lock** → sekretaris tidak bisa ubah
- **Admin sekolah bypass lock** — bisa edit tanggal apapun kapan saja (belum dibangun)

#### Detail Dashboard Sekretaris
- Semua siswa **default H (Hadir)** saat halaman dibuka
- Klik **H** → langsung tersimpan ke DB, tanpa keterangan
- Klik **S/I/A** → muncul input keterangan opsional inline + tombol "Simpan"
- Setelah lewat jam lock → halaman read-only, semua tombol disabled
- File: `lib/sekretaris/check-jam-lock.ts`, `app/sekretaris/actions.ts`, `app/sekretaris/page.tsx`, `app/sekretaris/AbsensiList.tsx`

### Rekap Absensi ✅ SELESAI

#### Rekap Bulanan (`/admin/rekap/bulanan`)
- Grid baris=siswa, kolom=tanggal 1–31
- H = putih (no bg), S = kuning/amber, I = biru muda, A = merah muda, Libur = abu-abu (italic keterangan libur)
- Kolom ringkasan di kanan: total S, I, A per siswa
- **Download PDF**: `window.print()` — otomatis landscape, hanya tabel yang tampil
- **Download Excel**: via `GET /api/rekap/excel/bulanan?bulan=&tahun=` (exceljs, warna sel sesuai status)
- Header: nama sekolah + tahun ajaran + kelas + bulan & tahun
- Warna palet: indigo/purple

#### Rekap Semester (`/admin/rekap/semester`)
- Ringkasan S/I/A per bulan per siswa + total keseluruhan semester
- **Download PDF**: `window.print()`
- **Download Excel**: via `POST /api/rekap/excel/semester` (exceljs)
- Header: nama sekolah + tahun ajaran + kelas + nama semester

#### Halaman Pemilih Rekap (`/admin/rekap`)
- Dropdown kelas (dari kelas aktif milik sekolah)
- Tab jenis: Per Bulan / Per Semester
- Kalau Bulanan → pilih bulan & tahun
- Kalau Semester → pilih semester (dropdown berisi semua semester dari semua tahun ajaran)
- Tombol "Lihat Rekap" → redirect ke halaman rekap yang sesuai

### Manajemen Siswa
- Tambah manual ✅
- Import bulk via Excel ✅ — kolom: `Nama Siswa | NIS | Jenis Kelamin (L/P) | Kelas`; NIS duplikat ditolak; nomor absen otomatis alfabetis
- Nonaktifkan siswa ✅
- Siswa pindah kelas: absensi lama tetap terikat kelas lama (via `SiswaKelas`)

### Kenaikan Kelas (belum dibangun)
- Tiap tahun ajaran baru, admin buat ulang kelas (nama sama, tahun ajaran berbeda)
- Fitur Proses Kenaikan Kelas: admin pilih siswa yang naik, pilih kelas tujuan → `SiswaKelas` baru dibuat, `tanggalKeluar` kelas lama terisi
- Data absensi lama tidak berubah

### Dashboard Wali Kelas (belum dibangun)
- Hanya bisa lihat rekap kelas yang ditugaskan ke mereka
- Tidak bisa input absensi
- Scope: rekap bulanan + rekap semester kelas sendiri

---

## Fitur Fase Berikutnya (Bukan MVP)

- Self-service onboarding (daftar + bayar sendiri)
- Notifikasi/reminder ke sekretaris (PWA/WhatsApp/email)
- Multi-admin per sekolah
- Log aktivitas (audit trail)
- PWA

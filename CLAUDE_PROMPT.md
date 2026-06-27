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
│       │   ├── tambah/
│       │   │   ├── page.tsx
│       │   │   └── TambahSiswaForm.tsx   ✅ glassmorphism
│       │   └── import/
│       │       ├── page.tsx              ✅ wrapper server component
│       │       ├── actions.ts            ✅ generateTemplateAction + importSiswaAction
│       │       └── ImportSiswaForm.tsx   ✅ glassmorphism — download template + upload + hasil import
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
│   ├── (⚠️ ditemukan saat audit: Sidebar admin TIDAK punya link ke tahun-ajaran — halaman bisa diakses via URL langsung tapi tidak ada navigasi dari UI)
│   └── tahun-ajaran/
│       ├── page.tsx                      ✅ ditemukan saat audit — list TahunAjaran + Semester + toggle aktif
│       ├── actions.ts                    ✅ toggleTahunAjaranAction + toggleSemesterAction
│       └── tambah/
│           ├── page.tsx
│           └── TambahTahunAjaranForm.tsx
├── lib/sekretaris/
│   └── check-jam-lock.ts                 ✅ isJamLockTerlewati() + getTanggalHariIni() (timezone-aware)
├── app/sekretaris/
│   ├── layout.tsx                        ✅ glassmorphism (reuse Header admin)
│   ├── page.tsx                          ✅ fetch kelas + siswa + absensi hari ini + status jam lock
│   ├── actions.ts                        ✅ setStatusAbsensiAction (upsert, validasi kelas + jam lock)
│   └── AbsensiList.tsx                   ✅ client component — tombol cepat H/S/I/A + keterangan inline
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
└── components/sekretaris/
    └── Sidebar.tsx                       ✅ glassmorphism — 1 menu: Absensi Hari Ini
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
  - ✅ **Import siswa bulk via Excel** — lihat detail di "Manajemen Siswa" di bawah
- ✅ **Bug fix**: `app/admin/kelas/tambah/page.tsx` tidak fetch & kirim prop `tahunAjaranList` ke `TambahKelasForm` (pre-existing, ketemu saat build setelah fitur import siswa)
- ✅ **Bug fix**: `app/login/actions.ts` — `verifyPassword` dipanggil dengan `user.password` yang bertipe `string | null` (field nullable di schema, sisa pola better-auth). Fix: tambah `!user.password` ke kondisi gagal login sebelum verify
- ✅ **Dashboard Sekretaris** (`/sekretaris`) — lihat detail di "Detail Dashboard Sekretaris" di bawah, sudah ditest & build sukses

---

## Yang Belum Dikerjakan ⬜

- [ ] **`HariLibur`** — belum ada implementasi UI sama sekali (model ada di schema, tapi belum dipakai di kode manapun). `TahunAjaran` & `Semester` **sudah ada** halaman admin lengkap (`/admin/tahun-ajaran`) — baru ditemukan saat audit sesi ini, sebelumnya belum tercatat di sini.
- [ ] Rekap bulanan — grid H/S/I/A per tanggal + warna ← **NEXT**
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

### Input Absensi (Sekretaris) ✅ SELESAI
- 1 sekretaris = 1 kelas (ditugaskan admin), kelas otomatis saat login
- Hanya bisa input/edit absensi **hari ini saja**
- Setelah **jam lock** → sekretaris tidak bisa ubah
- **Admin sekolah bypass lock** — bisa edit tanggal apapun kapan saja (belum dibangun — ini scope dashboard Admin, beda dari dashboard Sekretaris)

#### Detail Dashboard Sekretaris (✅ selesai, sudah ditest & build sukses)
**Keputusan final:**
- Semua siswa **default H (Hadir)** saat halaman dibuka — sekretaris cukup klik tombol cepat untuk siswa yang S/I/A saja, tidak perlu klik H satu-satu.
- Klik tombol **H** → langsung tersimpan ke DB, tanpa keterangan.
- Klik tombol **S/I/A** → muncul input keterangan opsional inline + tombol "Simpan" kecil, baru tersimpan setelah diklik.
- Field `keterangan` dipakai (opsional, bebas teks, contoh: alasan izin/sakit).
- Setelah lewat **jam lock** (`KonfigurasiSekolah.jamLock`, format `HH:MM`, dibandingkan sesuai `zonaWaktu` sekolah) → halaman tetap tampil data (read-only), semua tombol disabled.

**File:**
- `lib/sekretaris/check-jam-lock.ts` — `isJamLockTerlewati(jamLock, zonaWaktu)` dan `getTanggalHariIni(zonaWaktu)`, keduanya timezone-aware pakai `Intl.DateTimeFormat` (tidak perlu library tambahan)
- `app/sekretaris/actions.ts` — `setStatusAbsensiAction(siswaId, status, keterangan?)`: validasi role SEKRETARIS + siswa benar ada di kelas sekretaris ini + belum lewat jam lock, lalu `upsert` ke `Absensi` (unique constraint `siswaId_tanggal`)
- `app/sekretaris/layout.tsx` — shell dashboard, reuse `Header` admin (generic, tidak perlu duplikat)
- `components/sekretaris/Sidebar.tsx` — sidebar simpel 1 menu ("Absensi Hari Ini"), footer label **"Petugas Absensi"**
- `app/sekretaris/page.tsx` — server component: fetch kelas sekretaris (via tabel `Sekretaris`), siswa aktif di kelas itu (urut `nomorAbsen`), absensi hari ini (kalau ada), status jam lock. Render badge "Terkunci sejak [jam]" atau "Bisa diisi sampai [jam]"
- `app/sekretaris/AbsensiList.tsx` — client component: list siswa, 4 tombol cepat H/S/I/A per orang, input keterangan inline untuk S/I/A

**Catatan**: middleware (`/sekretaris/:path*`) sudah proteksi route ini sejak awal, tidak perlu diubah.

**Catatan proses (penting untuk Claude di sesi depan)**: saat mengerjakan `page.tsx` di sesi ini, sempat muncul file `page.tsx` dan `AbsensiList.tsx` di sandbox yang tidak ditulis lewat tool call yang sah/disengaja dalam giliran tsb — kemungkinan sisa state dari proses sebelumnya. File itu dihapus dan ditulis ulang dari nol secara sengaja sebelum dikirim ke Haru, supaya isinya bisa dipertanggungjawabkan baris per baris. Pelajaran: selalu verifikasi `ls`/`view` folder target sebelum `create_file` kalau ada kejanggalan, dan jangan kirim file yang prosesnya tidak diingat dengan jelas.

---

### Manajemen Siswa
- Tambah manual ✅ sudah ada
- Import bulk via Excel ✅ **SELESAI** — lihat "Detail Import Siswa Excel" di bawah
- Nonaktifkan siswa ✅ sudah ada
- Siswa pindah kelas: absensi lama tetap terikat kelas lama (via `SiswaKelas`)

#### Detail Import Siswa Excel (✅ selesai, sudah ditest & build sukses)
**Library**: `exceljs` (MIT license, gratis), `"exceljs": "^4.4.0"` di `package.json`.

**Keputusan final:**
- Nomor absen hasil import: **otomatis alfabetis per kelas**, lanjut dari nomor terakhir yang sudah ada di kelas tsb.
- NIS duplikat (vs database existing maupun duplikat di dalam file itu sendiri): **ditolak**, jadi baris error — tidak ada update/overwrite data existing.
- Kolom Excel: `Nama Siswa | NIS | Jenis Kelamin (L/P) | Kelas`.

**File:**
- `package.json` — tambah `exceljs`
- `app/admin/siswa/import/actions.ts` — `generateTemplateAction()` (generate `.xlsx` base64, dropdown L/P + dropdown Kelas dari sheet `_RefKelas` hidden) dan `importSiswaAction(formData)` (parse, validasi per baris, hitung nomor absen alfabetis, insert via `$transaction`)
- `app/admin/siswa/import/page.tsx` — wrapper server component
- `app/admin/siswa/import/ImportSiswaForm.tsx` — client component: tombol download template, form upload, tampilan hasil (total berhasil/gagal + list error per baris)
- `app/admin/siswa/page.tsx` — tombol "Import Excel" di sebelah tombol "Tambah Siswa"

**Bug pre-existing yang ketemu & diperbaiki di tengah proses ini (tidak terkait fitur import siswa, tapi blocking build):**
1. `app/admin/kelas/tambah/page.tsx` — lupa fetch & kirim prop `tahunAjaranList` ke `TambahKelasForm`. Fix: jadi async server component, fetch `prisma.tahunAjaran.findMany()` (yang aktif), kirim sebagai prop.
2. `app/login/actions.ts` — `verifyPassword(password, user.password)` error karena `user.password` bertipe `string | null` di schema (field nullable, sisa pola better-auth). Fix: tambah `!user.password` ke kondisi early-return gagal login.

**Catatan**: sandbox Claude tidak punya akses ke `binaries.prisma.sh`, jadi `prisma generate` gagal di sandbox (403). Tidak berpengaruh ke environment Haru — semua fix di atas sudah dikonfirmasi build sukses oleh Haru langsung.

---

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

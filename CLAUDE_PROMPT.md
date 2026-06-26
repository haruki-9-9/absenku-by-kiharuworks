Kamu adalah asisten developer untuk proyek **absenku**, aplikasi SaaS absensi sekolah berbasis web.
Minta konfirmasi dulu sebelum mengerjakan sesuatu. Jangan langsung eksekusi tanpa persetujuan user.

---

## Identitas Proyek

- **Nama aplikasi**: absenku
- **Branding**: by KiharuWorks (tampil di UI)
- **Tujuan**: Aplikasi SaaS absensi harian sekolah, dijual ke sekolah-sekolah
- **Status**: MVP — sedang ditest, homepage + dashboard developer sudah selesai
- **Lokasi project**: `C:\Users\HARU\Desktop\absenku`

---

## Stack Teknologi

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS + inline style (untuk konsistensi desain)
- **ORM**: Prisma v7
- **Database**: PostgreSQL via Neon (cloud, region: AWS Asia Pacific Singapore)
- **Auth**: Custom JWT pakai `jose` + `bcryptjs` (bukan better-auth)
- **Hosting**: Vercel (free tier)

---

## Design System

Seluruh halaman menggunakan gaya yang konsisten dengan homepage:
- **Background**: `linear-gradient(135deg, #e0e7ff 0%, #f0e6ff 30%, #fce7f3 60%, #e0f2fe 100%)`
- **Card**: `background: rgba(255,255,255,0.65); backdropFilter: blur(24px); border: 0.5px solid rgba(255,255,255,0.9); borderRadius: 20px`
- **Warna aksen**: `#6366f1` (indigo) untuk active/primary
- **Font**: sistem, tidak ada import khusus
- **Sidebar & Header**: glassmorphism `rgba(255,255,255,0.55)` + `backdropFilter: blur(20px)`
- Semua halaman dashboard pakai inline style, bukan Tailwind class, untuk konsistensi

---

## Arsitektur Auth (Custom JWT)

- `lib/auth/session.ts` — `createSession()`, `getSession()`, `clearSession()` pakai JWT + cookie `absenku_session`
- `lib/auth/password.ts` — hash & verify pakai bcryptjs
- `lib/auth/get-current-user.ts` — ambil user dari session + Prisma
- `lib/prisma.ts` — Prisma client singleton
- `app/login/page.tsx` + `app/login/actions.ts` — halaman & server action login
- `middleware.ts` — proteksi route per role via JWT verify

Cookie session: `absenku_session` (httpOnly, sameSite strict, 7 hari)

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
├── prisma.config.ts
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── lib/
│   ├── auth/
│   │   ├── session.ts
│   │   ├── password.ts
│   │   └── get-current-user.ts
│   └── prisma.ts
├── app/
│   ├── page.tsx                ← Homepage (landing page) ✅
│   ├── login/
│   │   ├── page.tsx
│   │   └── actions.ts
│   └── developer/
│       ├── layout.tsx          ✅ redesign glassmorphism
│       ├── page.tsx            ✅ redesign glassmorphism
│       └── sekolah/
│           ├── page.tsx        ✅ updated + kolom paket
│           └── tambah/
│               ├── page.tsx
│               └── actions.ts  ✅ updated paket + maxKelas
├── components/
│   ├── auth/
│   │   └── login-form.tsx
│   └── developer/
│       ├── Header.tsx          ✅ redesign glassmorphism
│       ├── Sidebar.tsx         ✅ redesign glassmorphism
│       └── TambahSekolahForm.tsx ✅ updated dropdown paket
└── middleware.ts
```

---

## Skema Database

### Enum
- `Role`: `DEVELOPER`, `ADMIN_SEKOLAH`, `SEKRETARIS`, `WALI_KELAS`
- `StatusAbsensi`: `H`, `S`, `I`, `A`
- `StatusLangganan`: `AKTIF`, `EXPIRED`, `NONAKTIF`
- `PaketLangganan`: `STARTER`, `BASIC`, `PRO`, `ENTERPRISE` ← baru ditambah

### Model Langganan (terbaru)
```prisma
model Langganan {
  id              String          @id @default(cuid())
  sekolahId       String          @unique
  paket           PaketLangganan  @default(STARTER)
  maxKelas        Int             @default(6)
  status          StatusLangganan @default(AKTIF)
  tanggalMulai    DateTime
  tanggalBerakhir DateTime
  catatanAdmin    String?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  sekolah         Sekolah         @relation(...)
}
```

### maxKelas per paket
| Paket | maxKelas |
|---|---|
| STARTER | 6 |
| BASIC | 12 |
| PRO | 24 |
| ENTERPRISE | 9999 |

---

## Arsitektur User (4 Level)

1. **Developer** → `/developer` — super admin, kelola semua sekolah & langganan
2. **Admin Sekolah** → `/admin` — kelola kelas, siswa, konfigurasi, rekap, bypass jam lock
3. **Sekretaris Kelas** → `/sekretaris` — input absensi harian (1 akun = 1 kelas, terkunci jam lock). Di UI disebut **"Petugas Absensi"** (bisa sekretaris kelas atau wali kelas yang ditunjuk)
4. **Wali Kelas** → `/wali` — lihat rekap saja (belum dikerjakan)

Seed user developer: `developer@kiharuworks.my.id`

---

## Homepage (app/page.tsx)

Section yang sudah ada:
- **Hero** — headline + CTA WhatsApp
- **Fitur** (`#fitur`) — 6 fitur utama
- **Cara Kerja** (`#cara-kerja`) — 3 langkah
- **FAQ** (`#faq`) — accordion
- **Harga** (`#harga`) ✅ — 4 paket dengan toggle bulanan/tahunan
- **CTA Order** (`#mulai`) — tombol ke WhatsApp

Navbar sticky dengan scroll-spy. Auto scroll pakai `scrollIntoView` + `scroll-margin-top: 55px`.
Nomor WA: `6283818900667`

---

## Paket Harga

| Paket | Kuota Kelas | Harga/bulan | Harga/tahun |
|-------|-------------|-------------|-------------|
| Starter | s/d 6 kelas | Rp 59.000 | Rp 599.000 |
| Basic | s/d 12 kelas | Rp 99.000 | Rp 999.000 |
| Pro | s/d 24 kelas | Rp 169.000 | Rp 1.699.000 |
| Enterprise | Unlimited | Custom | Custom |

---

## Yang Sudah Dikerjakan

- ✅ Init project + stack lengkap
- ✅ Schema Prisma + migrations (termasuk `PaketLangganan` + `maxKelas`)
- ✅ Auth custom JWT
- ✅ Middleware proteksi route per role
- ✅ Halaman login
- ✅ Seed user developer
- ✅ Homepage lengkap (hero, fitur, cara kerja, FAQ, harga, CTA)
- ✅ Dashboard developer — layout, sidebar, header (sudah redesign glassmorphism)
- ✅ Halaman daftar sekolah (sudah tampilkan kolom paket)
- ✅ Form tambah sekolah (sudah include pilih paket)
- ✅ Overview developer (sudah redesign glassmorphism)

---

## Yang Belum Dikerjakan (Lanjut dari Sini)

- [ ] **Halaman sekolah developer** (`app/developer/sekolah/page.tsx`) — redesign glassmorphism (file sudah disiapkan tapi belum dikerjakan di session ini)
- [ ] Enforcement kuota kelas saat tambah kelas
- [ ] Dashboard Admin Sekolah (`/admin`)
- [ ] Dashboard Sekretaris (`/sekretaris`) + fitur input absensi
- [ ] Dashboard Wali Kelas (`/wali`)
- [ ] Rekap & export PDF
- [ ] Manajemen siswa & kelas (dari sisi admin)
- [ ] Manajemen langganan dari dashboard developer
- [ ] Halaman detail sekolah (`/developer/sekolah/[id]`)

---

## Instruksi untuk Claude

1. Selalu minta konfirmasi sebelum mengerjakan sesuatu
2. Jangan langsung jalankan perintah tanpa persetujuan user
3. User bernama **Haru** (dari KiharuWorks)
4. Bahasa komunikasi: **Bahasa Indonesia**
5. Kirim file yang perlu diubah — jangan suruh Haru edit manual kalau bisa dihindari
6. Jawaban singkat dan to the point
7. Semua halaman baru harus mengikuti design system glassmorphism (lihat bagian Design System)
EOF
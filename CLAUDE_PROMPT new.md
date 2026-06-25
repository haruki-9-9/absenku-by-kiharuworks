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

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **ORM**: Prisma v7
- **Database**: PostgreSQL via Neon (cloud, free tier, region: AWS Asia Pacific Singapore)
- **Auth**: better-auth v1.6.20
- **Hosting**: Vercel (free tier)
- **Lokasi project**: `C:\Users\HARU\Desktop\absenku`

---

## Yang Sudah Dikerjakan

1. ✅ Project Next.js 15 di-init dengan App Router + TypeScript + Tailwind + ESLint
2. ✅ Prisma v7 terinstall dan di-init (`prisma.config.ts` sudah ada)
3. ✅ Database Neon sudah dibuat dan terhubung
4. ✅ `schema.prisma` lengkap sudah dibuat dan di-migrate ke Neon
5. ✅ better-auth terinstall dan dikonfigurasi di `lib/auth.ts`
6. ✅ better-auth client di `lib/auth-client.ts`
7. ✅ API route di `app/api/auth/[...all]/route.ts`
8. ✅ Halaman login di `app/login/page.tsx` (sudah pakai better-auth client)
9. ✅ `proxy.ts` untuk proteksi route per role
10. ✅ User developer sudah dibuat via seed (`developer@kiharuworks.my.id`)

## 🔴 Masalah yang Belum Selesai (Lanjutkan dari Sini)

Halaman login di `localhost:3000/login` error dengan pesan:

```
[Error: The router state header was sent but could not be parsed.]
GET /login 500
GET /api/auth/providers 404
GET /api/auth/error 200
```

**Yang sudah dicoba:**
- Downgrade dari Next.js 16 → 15
- Ganti dari next-auth → better-auth
- Hapus file `auth.ts` lama (next-auth) di root folder
- Hapus `types/next-auth.d.ts`
- Tambah `BETTER_AUTH_URL` dan `BETTER_AUTH_SECRET` di `.env`
- Update `lib/auth.ts` dengan baseURL dan secret
- `npm uninstall next-auth`
- `rm -rf .next` dan restart dev server

**Dugaan masalah:**
- `/api/auth/providers` adalah endpoint next-auth yang masih dicall dari suatu tempat (padahal next-auth sudah diuninstall)
- Kemungkinan ada cache atau file yang belum bersih

**Langkah terakhir yang disarankan sebelum handoff:**
```bash
npm uninstall next-auth
rm -rf .next
npm run dev
```
Belum diketahui hasilnya.

---

## Struktur File Penting

```
absenku/
├── .env                          ← DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, NEXT_PUBLIC_APP_URL
├── prisma.config.ts              ← konfigurasi Prisma v7
├── prisma/
│   ├── schema.prisma             ← skema lengkap
│   └── seed.ts                   ← seed user developer
├── lib/
│   ├── auth.ts                   ← konfigurasi better-auth (SERVER)
│   ├── auth-client.ts            ← better-auth client (CLIENT)
│   └── prisma.ts                 ← Prisma client singleton
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...all]/
│   │           └── route.ts      ← better-auth API handler
│   └── login/
│       └── page.tsx              ← halaman login
└── proxy.ts                      ← middleware proteksi route
```

---

## Isi File Kunci

### `lib/auth.ts`
```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const neonAdapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter: neonAdapter });

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  user: {
    additionalFields: {
      role: { type: "string", required: true, defaultValue: "SEKRETARIS", input: false },
      isActive: { type: "boolean", required: true, defaultValue: true, input: false },
      sekolahId: { type: "string", required: false, input: false },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
});

export type Session = typeof auth.$Infer.Session;
```

### `lib/auth-client.ts`
```typescript
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const { signIn, signOut, signUp, useSession } = authClient;
```

### `app/api/auth/[...all]/route.ts`
```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
```

### `proxy.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const sessionCookie =
    req.cookies.get("better-auth.session_token")?.value ||
    req.cookies.get("__Secure-better-auth.session_token")?.value;

  const isLoggedIn = !!sessionCookie;

  if (pathname === "/login") {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/developer/:path*",
    "/admin/:path*",
    "/sekretaris/:path*",
    "/wali/:path*",
  ],
};
```

---

## Skema Database

Tabel yang ada di database:

| Tabel | Keterangan |
|---|---|
| `user` | Semua user (kompatibel dengan better-auth) |
| `session` | Session better-auth |
| `account` | Account better-auth |
| `verification` | Verification better-auth |
| `sekolah` | Data sekolah, multi-tenant |
| `langganan` | Status & periode langganan per sekolah |
| `konfigurasi_sekolah` | Jam lock absensi, batas alpa, zona waktu |
| `sekretaris` | Relasi user ↔ kelas (1 sekretaris = 1 kelas) |
| `kelas` | Daftar kelas per sekolah |
| `siswa` | Data siswa + flag isActive |
| `siswa_kelas` | Histori siswa di kelas |
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

1. **Developer** — super admin, kelola semua sekolah & langganan
2. **Admin Sekolah** — kelola kelas, siswa, konfigurasi, rekap, bypass jam lock
3. **Sekretaris Kelas** — input absensi harian (1 akun = 1 kelas, terkunci jam lock)
4. **Wali Kelas** — lihat rekap saja (fase berikutnya)

---

## .env yang Dibutuhkan

```
DATABASE_URL="postgresql://..."         ← dari Neon
BETTER_AUTH_SECRET="..."                ← random secret
BETTER_AUTH_URL="http://localhost:3000" ← dev, ganti ke domain di production
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Yang Belum Dikerjakan (Setelah Auth Selesai)

- [ ] Fix masalah login (prioritas sekarang)
- [ ] Redirect setelah login ke dashboard per role
- [ ] Dashboard Developer
- [ ] Dashboard Admin Sekolah
- [ ] Dashboard Sekretaris
- [ ] Fitur absensi
- [ ] Rekap & export
- [ ] Manajemen siswa & kelas
- [ ] PDF cetak form absensi

---

## Instruksi untuk Claude

1. Selalu minta konfirmasi sebelum mengerjakan sesuatu
2. Jangan langsung jalankan perintah tanpa persetujuan user
3. User bernama **Haru** (dari KiharuWorks)
4. Bahasa komunikasi: **Bahasa Indonesia**
5. Kirim file yang perlu diubah (jangan suruh user edit manual kalau bisa dihindari)
6. **Prioritas sekarang**: fix halaman login agar bisa login dengan better-auth

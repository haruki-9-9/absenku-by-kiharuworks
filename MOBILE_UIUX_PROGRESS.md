# Progress Mobile UI/UX — absenku

Checklist kerja supaya bisa dilanjut di sesi Claude manapun kalau kena limit.
Cara pakai: centang `[x]` setelah selesai DAN sudah dites. Update juga bagian
"Status Terakhir" di paling bawah setiap akhir sesi.

---

## Konteks & Keputusan Desain

- Dashboard pakai inline style (bukan Tailwind), sesuai konvensi project — lihat CLAUDE_PROMPT.md
- Breakpoint mobile: `max-width: 768px` (sama seperti yang sudah dipakai di homepage `app/globals.css`)
- Pola navigasi mobile per role:
  - **Sekretaris** (2 menu) → Bottom nav
  - **Wali Kelas** (3 menu) → Bottom nav
  - **Developer** (3 menu) → Bottom nav
  - **Admin Sekolah** (11 menu) → Hamburger + drawer (terlalu banyak untuk bottom nav)
- Sidebar desktop (`SharedSidebar`) disembunyikan total di mobile (`display: none` via breakpoint), bukan di-collapse jadi ikon — supaya tidak ada sisa ruang sempit yang tidak terpakai

---

## Pekerjaan 1 — Komponen Navigasi Mobile Baru

- [x] Buat `components/shared/BottomNav.tsx` — dipakai sekretaris, wali, developer
- [x] Buat `components/shared/MobileDrawer.tsx` — drawer slide-in khusus admin (lebih banyak menu)
- [x] Buat `components/shared/MobileTopBar.tsx` — header ringkas mobile (logo + tombol hamburger untuk admin, atau logo saja untuk yang pakai bottom nav)
- [x] Update `SharedSidebar.tsx` — tambah `display: none` di breakpoint mobile

## Pekerjaan 2 — Update Layout per Role

- [x] `app/admin/layout.tsx` — pasang `MobileTopBar` + `MobileDrawer` via `AdminMobileNav` (client wrapper), header desktop disembunyikan di mobile, padding main content diubah di mobile
- [x] `app/sekretaris/layout.tsx` — pasang `SekretarisBottomNav` (MobileTopBar + BottomNav), padding-bottom 80px di mobile
- [x] `app/wali/layout.tsx` — pasang `WaliBottomNav` (MobileTopBar + BottomNav), padding-bottom 80px di mobile
- [x] `app/developer/layout.tsx` — pasang `DeveloperBottomNav` (MobileTopBar + BottomNav), padding-bottom 80px di mobile

**File baru yang dibuat di Pekerjaan 2:**
- `components/admin/AdminMobileNav.tsx` — client component (useState untuk open/close drawer), berisi navItems admin lengkap
- `components/sekretaris/SekretarisBottomNav.tsx` — client wrapper MobileTopBar + BottomNav
- `components/wali/WaliBottomNav.tsx` — client wrapper MobileTopBar + BottomNav
- `components/developer/DeveloperBottomNav.tsx` — client wrapper MobileTopBar + BottomNav

**Catatan implementasi:**
- Layout tetap server component; state drawer dipisah ke client component wrapper
- Desktop header disembunyikan di mobile via CSS class `.absenku-desktop-header`
- Main content padding mobile: sekretaris/wali/developer pakai `padding-bottom: 80px` supaya konten tidak tertutup bottom nav; admin cukup `padding: 16px` (tidak ada bottom nav)
- Icon size di BottomNav wrapper: 20px (lebih besar dari sidebar 16px, supaya lebih tap-friendly)

## Pekerjaan 3 — Halaman dengan Tabel/Grid Lebar

Untuk tiap halaman: cek dulu kondisi sekarang, baru putuskan solusinya
(card-view di mobile, atau scroll horizontal terkontrol + indikator, tergantung
kompleksitas datanya). Tandai pendekatan yang dipakai di kolom catatan.

- [x] `app/admin/siswa/page.tsx` — card view di mobile
- [x] `app/admin/pengguna/page.tsx` — card view di mobile
- [x] `app/admin/kelas/page.tsx` — card view di mobile
- [x] `app/admin/tahun-ajaran/page.tsx` — header responsive + tabel semester scroll horizontal
- [x] `app/admin/siswa-bermasalah/page.tsx` — card view + stat grid 3→2 kolom
- [x] `app/admin/kehadiran/KehadiranClient.tsx` — stat grid 5→3 kolom + tabel scroll horizontal
- [x] `app/admin/OverviewKehadiranWidget.tsx` — stat grid 4→2 kolom + tabel scroll horizontal
- [x] `app/admin/rekap/bulanan/RekapBulananClient.tsx` — sticky kolom No+Nama Siswa, indikator "geser tabel →" khusus mobile, tombol aksi & header meta stack di mobile (grid sudah ada scroll horizontal dari awal)
- [x] `app/admin/rekap/semester/RekapSemesterClient.tsx` — sticky kolom No+Nama Siswa (termasuk header rowSpan & baris total), indikator geser, tombol aksi & header meta stack di mobile
- [x] `app/wali/kehadiran/WaliKehadiranClient.tsx` — stat grid 5→2 kolom, header column di mobile, tabel scroll horizontal
- [x] `app/developer/page.tsx` — stat grid 4→2 kolom, tabel langganan mau habis scroll horizontal
- [x] `app/developer/sekolah/page.tsx` — card view di mobile (8 kolom tabel desktop → card ringkas)
- [x] `app/developer/sekolah/[id]/page.tsx` — header column di mobile, stat grid 3→2, info grid 4→2 & 3→2, tabel user scroll horizontal

## Pekerjaan 4 — Halaman Form

Kemungkinan sudah cukup aman (pakai flex column), tinggal verifikasi padding/lebar input.

- [ ] `app/admin/siswa/tambah/TambahSiswaForm.tsx`
- [ ] `app/admin/siswa/import/ImportSiswaForm.tsx`
- [ ] `app/admin/kelas/tambah/TambahKelasForm.tsx`
- [ ] `app/admin/pengguna/tambah/TambahPenggunaForm.tsx`
- [ ] `app/admin/pengguna/ResetPasswordModal.tsx`
- [ ] `app/admin/tahun-ajaran/tambah/TambahTahunAjaranForm.tsx`
- [ ] `app/admin/konfigurasi/KonfigurasiForm.tsx`
- [ ] `app/admin/hari-libur/HariLiburClient.tsx`
- [ ] `app/admin/kenaikan-kelas/KenaikanKelasClient.tsx`
- [ ] `app/developer/sekolah/tambah/page.tsx` + `components/developer/TambahSekolahForm.tsx`
- [ ] `app/developer/sekolah/[id]/LanggananForm.tsx`
- [ ] `components/shared/GantiPasswordForm.tsx`
- [ ] `components/auth/login-form.tsx`

## Pekerjaan 5 — Halaman Sekretaris (re-test setelah navigasi diubah)

- [ ] `app/sekretaris/page.tsx` + `AbsensiList.tsx` — re-test tampilan setelah sidebar diganti bottom nav, terutama di layar sempit (iPhone SE ~320px width)

## Sudah Aman (tidak perlu disentuh)

- [x] `app/page.tsx` (homepage) — sudah ada media query lengkap di `app/globals.css`
- [x] `app/login/page.tsx` — perlu verifikasi cepat saja, kemungkinan sudah oke (halaman sederhana)

---

## Status Terakhir

**Tanggal sesi**: 2026-06-28
**Selesai sampai**: Pekerjaan 3 **selesai semua** (13/13 file). Semua halaman bertabel/grid lebar sudah dapat solusi mobile (card-view untuk tabel ringkas, scroll horizontal + sticky kolom untuk grid kompleks rekap bulanan/semester). 6 file final sudah dikirim ke Haru.
**Belum dites**: Semua perlu dites di mobile devtools (belum pernah dites visual sejak Pekerjaan 1):
  - Admin: hamburger buka/tutup drawer, semua 11 menu tampil, card view siswa/pengguna/kelas/siswa-bermasalah tampil benar
  - Sekretaris/Wali/Developer: bottom nav muncul, active state benar, konten tidak tertutup bottom nav
  - Rekap Bulanan & Semester: scroll horizontal + sticky kolom No/Nama berfungsi dan tidak tumpang tindih dengan konten lain saat di-scroll, indikator "geser →" tampil di mobile
  - Developer/sekolah/[id]: grid info & stat menyusut dengan benar di layar sempit
**Next**: Pekerjaan 4 — verifikasi halaman form (kemungkinan sudah cukup aman, tinggal cek padding/lebar input), lalu Pekerjaan 5 — re-test halaman sekretaris di layar sempit (iPhone SE ~320px).
**Catatan lain**: BottomNav & MobileDrawer reuse type `NavItem` dari `SharedSidebar.tsx` — kalau ubah struktur `NavItem`, cek dampaknya ke semua wrapper juga. Untuk file rekap bulanan/semester, sticky column pakai `position: sticky` + background solid (bukan transparan) supaya konten yang ter-scroll di baliknya tidak tembus terlihat.

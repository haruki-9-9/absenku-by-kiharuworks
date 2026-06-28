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

- [ ] `app/admin/siswa/page.tsx`
- [ ] `app/admin/pengguna/page.tsx`
- [ ] `app/admin/kelas/page.tsx`
- [ ] `app/admin/tahun-ajaran/page.tsx`
- [ ] `app/admin/siswa-bermasalah/page.tsx`
- [ ] `app/admin/kehadiran/KehadiranClient.tsx`
- [ ] `app/admin/OverviewKehadiranWidget.tsx`
- [ ] `app/admin/rekap/bulanan/RekapBulananClient.tsx` — **paling sulit**, grid siswa×tanggal(1-31). Kemungkinan: biarkan scroll horizontal + sticky kolom nama siswa + indikator visual "geser →"
- [ ] `app/admin/rekap/semester/RekapSemesterClient.tsx`
- [ ] `app/wali/kehadiran/WaliKehadiranClient.tsx`
- [ ] `app/developer/page.tsx`
- [ ] `app/developer/sekolah/page.tsx`
- [ ] `app/developer/sekolah/[id]/page.tsx`

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
**Selesai sampai**: Pekerjaan 2 selesai semua (4 layout diupdate, 4 client wrapper baru dibuat). Belum dites visual di browser.
**Belum dites**: Semua perlu dites di mobile devtools:
  - Admin: cek hamburger buka/tutup drawer, semua 11 menu tampil, konten tidak di-cover topbar
  - Sekretaris/Wali/Developer: cek bottom nav muncul, active state benar, konten tidak tertutup bottom nav
**Next**: Pekerjaan 3 — audit & fix halaman bertabel/grid lebar. Mulai dari yang paling sering dipakai (kehadiran, siswa) sebelum rekap bulanan yang paling kompleks.
**Catatan lain**: BottomNav & MobileDrawer reuse type `NavItem` dari `SharedSidebar.tsx` — kalau ubah struktur `NavItem`, cek dampaknya ke semua wrapper juga.

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const WA_NUMBER = "6283818900667";
const WA_MESSAGE = encodeURIComponent(
  "Halo Haruki, saya tertarik dengan absenku. Boleh info lebih lanjut?"
);
const WA_LINK = `https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`;

const WA_SVG = (
  <svg style={{ width: 18, height: 18, fill: "currentColor" }} viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12.004 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.985-1.306A9.953 9.953 0 0012.004 22C17.53 22 22 17.523 22 12S17.53 2 12.004 2z" />
  </svg>
);

export default function HomePage() {
  const router = useRouter();
  const [pricingPeriod, setPricingPeriod] = useState<"bulanan" | "tahunan">("bulanan");

  useEffect(() => {
    // Reveal on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
          } else {
            e.target.classList.remove("visible");
          }
        });
      },
      { threshold: 0.08 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

    // Navbar scroll shadow
    const nav = document.querySelector(".nav") as HTMLElement | null;
    function handleNavScroll() {
      if (!nav) return;
      if (window.scrollY > 10) {
        nav.style.boxShadow = "0 2px 24px rgba(99,102,241,0.07)";
        nav.style.background = "rgba(255,255,255,0.88)";
      } else {
        nav.style.boxShadow = "";
        nav.style.background = "rgba(255,255,255,0.55)";
      }
    }
    window.addEventListener("scroll", handleNavScroll, { passive: true });
    handleNavScroll();

    // Scroll-to-top button
    const toTopBtn = document.querySelector(".to-top-btn") as HTMLElement | null;
    function handleToTopVisibility() {
      if (!toTopBtn) return;
      if (window.scrollY > 500) {
        toTopBtn.classList.add("visible");
      } else {
        toTopBtn.classList.remove("visible");
      }
    }
    window.addEventListener("scroll", handleToTopVisibility, { passive: true });
    handleToTopVisibility();

    // Count-up animation
    function countUp(el: HTMLElement, target: number) {
      let current = 0;
      const step = Math.ceil(target / 40);
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = String(current);
        if (current >= target) clearInterval(timer);
      }, 30);
    }

    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            document.querySelectorAll<HTMLElement>(".count-anim").forEach((el) => {
              countUp(el, parseInt(el.dataset.target || "0"));
            });
            statsObserver.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );
    const statsEl = document.getElementById("stats");
    if (statsEl) statsObserver.observe(statsEl);

    // Mockup counter animation
    function animateMockup() {
      const targets: [number, string][] = [
        [3, "c1"],
        [2, "c2"],
        [247, "c3"],
        [189, "c4"],
      ];
      targets.forEach(([t, id]) => {
        const el = document.getElementById(id);
        if (!el) return;
        let c = 0;
        const step = Math.ceil(t / 30);
        const timer = setInterval(() => {
          c = Math.min(c + step, t);
          el.textContent = String(c);
          if (c >= t) clearInterval(timer);
        }, 40);
      });
    }
    const mockupObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animateMockup();
            mockupObserver.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );
    const mockupEl = document.getElementById("mockup");
    if (mockupEl) mockupObserver.observe(mockupEl);

    // Sembunyikan sticky-wa saat section order terlihat (supaya tidak dobel)
    const stickyWa = document.querySelector(".sticky-wa") as HTMLElement | null;
    const orderObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!stickyWa) return;
          if (e.isIntersecting) {
            stickyWa.style.opacity = "0";
            stickyWa.style.pointerEvents = "none";
          } else {
            stickyWa.style.opacity = "1";
            stickyWa.style.pointerEvents = "auto";
          }
        });
      },
      { threshold: 0.1 }
    );
    const orderEl = document.getElementById("mulai");
    if (orderEl) orderObserver.observe(orderEl);

    return () => {
      observer.disconnect();
      statsObserver.disconnect();
      mockupObserver.disconnect();
      orderObserver.disconnect();
      window.removeEventListener("scroll", handleNavScroll);
      window.removeEventListener("scroll", handleToTopVisibility);
    };
  }, []);

  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const navHeight = (document.querySelector(".nav") as HTMLElement)?.offsetHeight ?? 70;
    const top = el.getBoundingClientRect().top + window.scrollY - navHeight - 16;
    window.scrollTo({ top, behavior: "smooth" });
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleFaq(el: HTMLElement) {
    const item = el.parentElement;
    if (!item) return;
    const isOpen = item.classList.contains("open");
    document.querySelectorAll(".faq-item").forEach((i) => i.classList.remove("open"));
    if (!isOpen) item.classList.add("open");
  }

  const features = [
    { icon: "📋", bg: "rgba(99,102,241,0.1)",  title: "Input absensi harian",    desc: "Sekretaris kelas input H/S/I/A dengan cepat. Ada jam lock otomatis sesuai jam yang dikonfigurasi sekolah." },
    { icon: "📊", bg: "rgba(34,197,94,0.1)",   title: "Rekap otomatis",           desc: "Rekap per siswa, per kelas, dan per semester langsung tersedia — tanpa hitung manual lagi." },
    { icon: "👥", bg: "rgba(139,92,246,0.1)",  title: "4 level akses",            desc: "Developer, Admin Sekolah, Sekretaris Kelas, Wali Kelas — masing-masing punya dashboard & akses sendiri." },
    { icon: "🏫", bg: "rgba(245,158,11,0.1)",  title: "Multi-sekolah",            desc: "Satu platform untuk banyak sekolah. Data tiap sekolah terisolasi, aman, dan tidak bercampur." },
    { icon: "📄", bg: "rgba(239,68,68,0.1)",   title: "Export & cetak PDF",       desc: "Ekspor rekap absensi ke PDF. Bisa cetak form absensi fisik langsung dari sistem kapan saja." },
    { icon: "⚙️", bg: "rgba(20,184,166,0.1)",  title: "Konfigurasi fleksibel",    desc: "Jam lock absensi, batas alpa, zona waktu bisa diatur sendiri oleh admin per sekolah." },
  ];

  const pricingPlans = [
    { plan: "Starter",    quota: "s/d 6 kelas",       monthly: 59000,  yearly: 599000,  popular: false },
    { plan: "Basic",      quota: "s/d 12 kelas",      monthly: 99000,  yearly: 999000,  popular: false },
    { plan: "Pro",        quota: "s/d 24 kelas",      monthly: 169000, yearly: 1699000, popular: true  },
    { plan: "Enterprise", quota: "Unlimited kelas",   monthly: null,   yearly: null,    popular: false },
  ];

  const pricingFeats = [
    "Input absensi harian",
    "Rekap otomatis",
    "Export & cetak PDF",
    "Konfigurasi jam lock",
  ];

  return (
    <>
      {/* Sticky WA (mobile) */}
      <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="sticky-wa">
        <span style={{ color: "#fff" }}>{WA_SVG}</span>
        Chat via WhatsApp
      </a>

      {/* Scroll to top */}
      <button
        type="button"
        className="to-top-btn"
        onClick={scrollToTop}
        aria-label="Scroll ke atas"
      >
        <svg style={{ width: 18, height: 18 }} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M14.78 9.78a.75.75 0 01-1.06 0L10 6.06 6.28 9.78a.75.75 0 01-1.06-1.06l4.25-4.25a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06z" clipRule="evenodd" />
          <path fillRule="evenodd" d="M10 4.5a.75.75 0 01.75.75v10a.75.75 0 01-1.5 0v-10A.75.75 0 0110 4.5z" clipRule="evenodd" />
        </svg>
      </button>

      {/* ── NAVBAR ─────────────────────────────── */}
      <nav className="nav">
        <div className="nav-brand">absenku <span>by KiharuWorks</span></div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => scrollToSection("fitur")}>Fitur</button>
          <button className="nav-link" onClick={() => scrollToSection("cara-kerja")}>Cara Kerja</button>
          <button className="nav-link" onClick={() => scrollToSection("faq")}>FAQ</button>
          <button className="nav-link" onClick={() => scrollToSection("harga")}>Harga</button>
        </div>
        <div className="nav-actions">
          <button className="btn-ghost" onClick={() => router.push("/login")}>Masuk</button>
          <button className="btn-primary" onClick={() => scrollToSection("harga")}>Pesan Sekarang</button>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────── */}
      <div className="hero">
        <div className="hero-badge">
          <span className="pulse-dot" />
          Aktif digunakan di SMKN 1 — MVP live
        </div>
        <h1>
          Absensi sekolah<br />
          jadi <span className="grad">lebih modern</span>
        </h1>
        <p className="hero-sub">
          Platform absensi harian digital untuk sekolah — input mudah oleh sekretaris,
          rekap otomatis, bisa diakses kapan saja dari browser.
        </p>
        <div className="hero-ctas">
          <button className="cta-main" onClick={() => scrollToSection("fitur")}>
            Lihat Fitur ↓
          </button>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="cta-wa">
            <span style={{ color: "#16a34a" }}>{WA_SVG}</span>
            Pesan via WhatsApp
          </a>
        </div>
      </div>

      {/* ── MOCKUP ─────────────────────────────── */}
      <div className="mockup-wrap reveal" id="mockup">
        <div className="mockup-browser">
          <div className="browser-bar">
            <div className="browser-dots">
              <div className="browser-dot" style={{ background: "#ff5f57" }} />
              <div className="browser-dot" style={{ background: "#febc2e" }} />
              <div className="browser-dot" style={{ background: "#28c840" }} />
            </div>
            <div className="browser-url">app.absenku.id</div>
          </div>
          <div className="dashboard-preview">
            <div className="preview-sidebar">
              <div className="preview-logo">
                absenku
                <span>by KiharuWorks</span>
              </div>
              <div className="preview-nav-item active">📊 Overview</div>
              <div className="preview-nav-item">🏫 Sekolah</div>
              <div className="preview-nav-item">📋 Absensi</div>
              <div className="preview-nav-item">👥 Siswa</div>
              <div className="preview-nav-item">⚙️ Pengaturan</div>
            </div>
            <div className="preview-main">
              <div className="preview-title">Overview Hari Ini</div>
              <div className="preview-cards">
                <div className="preview-card">
                  <div className="preview-card-num" style={{ color: "#6366f1" }} id="c1">0</div>
                  <div className="preview-card-label">Total Sekolah</div>
                </div>
                <div className="preview-card">
                  <div className="preview-card-num" style={{ color: "#22c55e" }} id="c2">0</div>
                  <div className="preview-card-label">Aktif</div>
                </div>
                <div className="preview-card">
                  <div className="preview-card-num" style={{ color: "#f59e0b" }} id="c3">0</div>
                  <div className="preview-card-label">Total Siswa</div>
                </div>
                <div className="preview-card">
                  <div className="preview-card-num" style={{ color: "#8b5cf6" }} id="c4">0</div>
                  <div className="preview-card-label">Absensi Hari Ini</div>
                </div>
              </div>
              <div className="preview-table-head">
                <div className="preview-th">Nama Siswa</div>
                <div className="preview-th">Kelas</div>
                <div className="preview-th">Status</div>
                <div className="preview-th">Waktu</div>
              </div>
              {[
                { name: "Aditya Pratama", kelas: "X RPL 1",  status: "Hadir", badge: "badge-h", time: "07:12" },
                { name: "Siti Rahayu",    kelas: "XI TKJ",   status: "Sakit", badge: "badge-s", time: "07:30" },
                { name: "Budi Santoso",   kelas: "XII AK",   status: "Hadir", badge: "badge-h", time: "07:08" },
                { name: "Dewi Lestari",   kelas: "X RPL 2",  status: "Alpa",  badge: "badge-a", time: "—"     },
              ].map((row, i) => (
                <div className="preview-row" key={i}>
                  <div className="preview-td">{row.name}</div>
                  <div className="preview-td">{row.kelas}</div>
                  <div className="preview-td"><span className={row.badge}>{row.status}</span></div>
                  <div className="preview-td">{row.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reflection efek bawah mockup */}
      <div className="mockup-reflection" />

      {/* ── FLOAT BADGES ───────────────────────── */}
      <div className="float-badges reveal">
        <div className="float-b"><span className="float-icon">✅</span>Input absensi &lt; 2 menit</div>
        <div className="float-b"><span className="float-icon">📊</span>Rekap otomatis real-time</div>
        <div className="float-b"><span className="float-icon">🔒</span>Data aman &amp; terenkripsi</div>
      </div>

      {/* ── STATS ──────────────────────────────── */}
      <div className="stats reveal" id="stats">
        <div className="stat">
          <div className="stat-n"><span className="count-anim" data-target="4">0</span></div>
          <div className="stat-l">Level pengguna</div>
        </div>
        <div className="stat">
          <div className="stat-n"><span className="count-anim" data-target="100">0</span>%</div>
          <div className="stat-l">Berbasis web</div>
        </div>
        <div className="stat">
          <div className="stat-n"><span className="count-anim" data-target="3">0</span> menit</div>
          <div className="stat-l">Setup absensi</div>
        </div>
        <div className="stat">
          <div className="stat-n"><span className="count-anim" data-target="24">0</span>/7</div>
          <div className="stat-l">Bisa diakses</div>
        </div>
      </div>

      {/* ── FITUR ──────────────────────────────── */}
      <div className="section reveal" id="fitur">
        <div className="sec-label">Fitur utama</div>
        <div className="sec-title">Semua yang dibutuhkan sekolah</div>
        <div className="sec-sub">Dirancang khusus untuk alur kerja absensi harian — simpel, cepat, dan akurat.</div>
        <div className="feat-grid">
          {features.map((f, i) => (
            <div className="feat-card reveal" key={i}>
              <div className="feat-icon" style={{ background: f.bg }}>{f.icon}</div>
              <div className="feat-title">{f.title}</div>
              <div className="feat-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── VS ─────────────────────────────────── */}
      <div className="section reveal">
        <div className="sec-label">Perbandingan</div>
        <div className="sec-title">absenku vs cara lama</div>
        <div className="sec-sub">Masih pakai buku absensi atau Excel? Ini bedanya.</div>
        <div className="vs-wrap">
          <div className="vs-card vs-old">
            <div className="vs-head">
              <span style={{ fontSize: 22 }}>📒</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#dc2626" }}>Cara lama</div>
                <span className="vs-tag vs-tag-old">Manual / Excel</span>
              </div>
            </div>
            {[
              "Rekap harus dihitung manual tiap bulan",
              "Buku absensi bisa hilang atau rusak",
              "Data tidak bisa diakses dari mana saja",
              "Wali kelas harus minta rekap manual",
              "Tidak ada notifikasi siswa sering alpa",
            ].map((t, i) => (
              <div className="vs-item" key={i}>
                <span className="vs-x">✗</span>
                <span style={{ color: "#64748b" }}>{t}</span>
              </div>
            ))}
          </div>
          <div className="vs-card vs-new">
            <div className="vs-head">
              <span style={{ fontSize: 22 }}>💻</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#4f46e5" }}>absenku</div>
                <span className="vs-tag vs-tag-new">Digital &amp; otomatis</span>
              </div>
            </div>
            {[
              "Rekap otomatis real-time, kapan saja",
              "Data tersimpan aman di cloud",
              "Bisa diakses dari HP atau laptop",
              "Wali kelas lihat rekap langsung di dashboard",
              "Jam lock otomatis, data lebih akurat",
            ].map((t, i) => (
              <div className="vs-item" key={i}>
                <span className="vs-check">✓</span>
                <span style={{ color: "#334155" }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CARA KERJA ─────────────────────────── */}
      <div className="section reveal" id="cara-kerja">
        <div className="sec-label">Cara kerja</div>
        <div className="sec-title">Mulai dalam 3 langkah</div>
        <div className="sec-sub" style={{ marginBottom: 28 }}>
          Tidak perlu install apapun. Langsung pakai dari browser.
        </div>
        <div className="steps-wrap">
          {[
            { n: 1, title: "Hubungi kami",   desc: "Chat via WhatsApp. Kami siapkan akun sekolah & Admin dalam hitungan menit." },
            { n: 2, title: "Setup sekolah",  desc: "Admin input data kelas, siswa, dan buat akun sekretaris tiap kelas." },
            { n: 3, title: "Mulai absensi",  desc: "Sekretaris langsung input absensi harian dari browser. Rekap langsung tersedia." },
          ].map((s) => (
            <div className="step-card" key={s.n}>
              <div className="step-num">{s.n}</div>
              <div className="step-title">{s.title}</div>
              <div className="step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FAQ ────────────────────────────────── */}
      <div className="section reveal" id="faq">
        <div className="sec-label">FAQ</div>
        <div className="sec-title" style={{ textAlign: "center" }}>Pertanyaan yang sering ditanyakan</div>
        <div className="sec-sub" style={{ textAlign: "center", maxWidth: "100%", marginBottom: 28 }}>
          Ada pertanyaan lain? Chat kami langsung via WhatsApp.
        </div>
        <div className="faq-list">
          {[
            {
              q: "Apakah bisa diakses dari HP?",
              a: "Ya, absenku berbasis web dan responsif. Bisa diakses dari HP, tablet, maupun laptop — cukup buka browser, tidak perlu install aplikasi.",
            },
            {
              q: "Data absensi aman tidak?",
              a: "Sangat aman. Data disimpan di cloud dengan enkripsi, dan tiap sekolah memiliki data yang terisolasi. Tidak ada sekolah lain yang bisa melihat data sekolah Anda.",
            },
            {
              q: "Berapa sekolah yang sudah pakai?",
              a: "Saat ini absenku sedang dalam tahap MVP dan digunakan di sekolah kami sendiri sebagai beta tester. Kami membuka pendaftaran untuk sekolah-sekolah awal yang ingin bergabung.",
            },
            {
              q: "Siapa yang input absensi dan bagaimana caranya?",
              a: "Absensi harian diinput oleh Petugas Absensi — satu orang per kelas, bisa sekretaris kelas atau wali kelas. Akunnya dibuat oleh Admin Sekolah melalui dashboard, tidak ada self-register. Petugas cukup buka browser, login, lalu input status H/S/I/A tiap siswa. Ada jam lock otomatis sesuai konfigurasi sekolah.",
            },
            {
              q: "Apakah ada masa percobaan gratis?",
              a: "Hubungi kami via WhatsApp untuk info trial dan harga. Kami terbuka untuk diskusi sesuai kebutuhan dan jumlah kelas di sekolah Anda.",
            },
          ].map((f, i) => (
            <div className="faq-item" key={i}>
              <button className="faq-q" onClick={(e) => toggleFaq(e.currentTarget)}>
                {f.q} <span className="faq-arrow">▾</span>
              </button>
              <div className="faq-a">{f.a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── HARGA ──────────────────────────────── */}
      <div className="pricing-outer reveal" id="harga">
        <div className="pricing-header">
          <div className="pricing-eyebrow">Harga</div>
          <div className="pricing-title">Pilih paket yang sesuai</div>
          <div className="pricing-sub">Semua fitur tersedia di setiap paket. Beda hanya di jumlah kelas.</div>
          <div className="pricing-toggle">
            <button
              className={"pricing-toggle-btn" + (pricingPeriod === "bulanan" ? " active" : "")}
              onClick={() => setPricingPeriod("bulanan")}
            >
              Bulanan
            </button>
            <button
              className={"pricing-toggle-btn" + (pricingPeriod === "tahunan" ? " active" : "")}
              onClick={() => setPricingPeriod("tahunan")}
            >
              Tahunan{" "}
              <span style={{ color: pricingPeriod === "tahunan" ? "#a5f3b4" : "#22c55e", fontSize: 11 }}>
                -15%
              </span>
            </button>
          </div>
        </div>
        <div className="pricing-grid">
          {pricingPlans.map((p) => (
            <div className={"pricing-card" + (p.popular ? " popular" : "")} key={p.plan}>
              {p.popular && <div className="pricing-badge">⭐ Terpopuler</div>}
              <div className="pricing-plan">{p.plan}</div>
              {p.monthly ? (
                <div className="pricing-price" style={pricingPeriod === "tahunan" ? { fontSize: 24 } : {}}>
                  {pricingPeriod === "bulanan" ? (
                    <>
                      Rp {p.monthly.toLocaleString("id-ID")}
                      <span>/bln</span>
                    </>
                  ) : (
                    <>
                      Rp {p.yearly!.toLocaleString("id-ID")}
                      <span>/thn</span>
                      <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, marginTop: 3 }}>
                        ≈ Rp {Math.round(p.yearly! / 12).toLocaleString("id-ID")}/bln
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="pricing-price-custom">Hubungi kami</div>
              )}
              <div className="pricing-quota">{p.quota}</div>
              <div className="pricing-feats">
                {pricingFeats.map((f) => (
                  <div className="pricing-feat" key={f}>
                    <div className="pricing-feat-check">✓</div>
                    {f}
                  </div>
                ))}
              </div>
              <a
                href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
                  `Halo Haruki, saya tertarik dengan paket ${p.plan} absenku. Boleh info lebih lanjut?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className={"pricing-cta " + (p.popular ? "pricing-cta-primary" : "pricing-cta-outline")}
              >
                {p.monthly ? "Mulai Sekarang" : "Hubungi Kami"}
              </a>
            </div>
          ))}
        </div>
        <div className="pricing-note">Semua harga belum termasuk PPN. Pembayaran via transfer bank.</div>
      </div>

      {/* ── ORDER / CTA ────────────────────────── */}
      <div className="order-outer reveal" id="mulai">
        <div className="order-card">
          <div className="order-eyebrow">Mulai sekarang</div>
          <div className="order-title">Siap digitalkan absensi sekolahmu?</div>
          <div className="order-sub">
            Hubungi kami via WhatsApp untuk info harga, demo, dan setup langsung.
          </div>
          <div className="order-feats">
            {[
              "Semua fitur termasuk tanpa biaya tambahan",
              "Setup & onboarding dibantu langsung",
              "Data aman, tersimpan di cloud",
              "Support via WhatsApp kapan saja",
              "Update fitur berkala tanpa biaya",
            ].map((t, i) => (
              <div className="order-feat" key={i}>
                <div className="check-circle">✓</div>
                {t}
              </div>
            ))}
          </div>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="btn-wa-big">
            <svg style={{ width: 20, height: 20, fill: "#fff" }} viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12.004 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.985-1.306A9.953 9.953 0 0012.004 22C17.53 22 22 17.523 22 12S17.53 2 12.004 2z" />
            </svg>
            Chat via WhatsApp Sekarang
          </a>
          <div className="order-note">Hubungi: Haruki — KiharuWorks</div>
        </div>
      </div>

      {/* ── FOOTER ─────────────────────────────── */}
      <div className="footer">
        <div className="footer-brand">absenku <span>by KiharuWorks</span></div>
        <div className="footer-copy">© 2026 KiharuWorks. Dibuat dengan ❤️ di Indonesia.</div>
      </div>
    </>
  );
}

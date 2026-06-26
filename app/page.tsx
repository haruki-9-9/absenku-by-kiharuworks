"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const WA_NUMBER = "6283818900667";
const WA_MESSAGE = encodeURIComponent(
  "Halo Haruki, saya tertarik dengan absenku. Boleh info lebih lanjut?"
);
const WA_LINK = `https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`;

export default function HomePage() {
  const router = useRouter();
  const blobRef = useRef<HTMLDivElement>(null);
  const [pricingPeriod, setPricingPeriod] = useState<"bulanan" | "tahunan">("bulanan");

  useEffect(() => {
    // Reveal on scroll — dua arah (fade in & fade out)
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
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

    // Navbar shadow saat scroll
    const nav = document.querySelector(".nav") as HTMLElement | null;
    function handleNavScroll() {
      if (!nav) return;
      if (window.scrollY > 10) {
        nav.style.boxShadow = "0 2px 20px rgba(0,0,0,0.08)";
        nav.style.background = "rgba(255,255,255,0.85)";
      } else {
        nav.style.boxShadow = "";
        nav.style.background = "rgba(255,255,255,0.55)";
      }
    }
    window.addEventListener("scroll", handleNavScroll, { passive: true });
    handleNavScroll();

    // Tombol scroll-to-top: muncul setelah scroll melewati hero
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

    // Count up animation
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
      { threshold: 0.3 }
    );
    const mockupEl = document.getElementById("mockup");
    if (mockupEl) mockupObserver.observe(mockupEl);

    return () => {
      observer.disconnect();
      statsObserver.disconnect();
      mockupObserver.disconnect();
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{font-family:'Inter',system-ui,-apple-system,sans-serif;background:linear-gradient(135deg,#dbeafe 0%,#ede9fe 40%,#fce7f3 70%,#e0f2fe 100%);min-height:100vh;overflow-x:hidden}

        .blob{position:fixed;border-radius:50%;filter:blur(80px);opacity:0.35;animation:blobMove 8s ease-in-out infinite;pointer-events:none;z-index:0}
        .blob1{width:400px;height:400px;background:#93c5fd;top:-100px;left:-100px;animation-delay:0s}
        .blob2{width:350px;height:350px;background:#c4b5fd;top:200px;right:-80px;animation-delay:2s}
        .blob3{width:300px;height:300px;background:#fbcfe8;bottom:100px;left:30%;animation-delay:4s}
        @keyframes blobMove{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(20px,-20px) scale(1.05)}66%{transform:translate(-15px,15px) scale(0.97)}}

        .nav{position:sticky;top:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:14px 40px;background:rgba(255,255,255,0.55);backdrop-filter:blur(24px);border-bottom:0.5px solid rgba(255,255,255,0.7);transition:all 0.3s}
        .nav-brand{font-size:15px;font-weight:700;color:#1e3a5f;font-family:'Plus Jakarta Sans',sans-serif;letter-spacing:-0.3px}
        .nav-brand span{color:#94a3b8;font-weight:400;font-family:'Inter',sans-serif}
        .nav-links{display:flex;gap:28px}
        .nav-link{font-size:13px;color:#475569;cursor:pointer;transition:color 0.2s;text-decoration:none;background:none;border:none}
        .nav-link:hover{color:#3b82f6}
        .nav-actions{display:flex;gap:8px}
        .btn-ghost{padding:7px 16px;border-radius:20px;border:0.5px solid rgba(100,120,200,0.3);background:rgba(255,255,255,0.6);color:#3b5a8a;font-size:13px;cursor:pointer;backdrop-filter:blur(8px);transition:all 0.2s}
        .btn-ghost:hover{background:rgba(255,255,255,0.85);transform:translateY(-1px)}
        .btn-primary{padding:7px 18px;border-radius:20px;border:none;background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;font-size:13px;cursor:pointer;font-weight:500;transition:all 0.2s;box-shadow:0 4px 12px rgba(99,102,241,0.3)}
        .btn-primary:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(99,102,241,0.4)}

        .hero{position:relative;z-index:1;text-align:center;padding:80px 40px 60px}
        .hero-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.65);border:0.5px solid rgba(99,102,241,0.25);border-radius:20px;padding:5px 14px;font-size:12px;color:#4f46e5;margin-bottom:28px;backdrop-filter:blur(12px);animation:fadeDown 0.6s ease both}
        .pulse-dot{width:7px;height:7px;border-radius:50%;background:#4ade80;animation:pulse 2s infinite;flex-shrink:0}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.6;transform:scale(1.3)}}
        .hero h1{font-size:52px;font-weight:800;color:#0f172a;line-height:1.1;margin-bottom:20px;animation:fadeUp 0.7s ease 0.1s both;letter-spacing:-1.5px;font-family:'Plus Jakarta Sans',sans-serif}
        .hero h1 .grad{background:linear-gradient(135deg,#3b82f6,#8b5cf6,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .hero-sub{font-size:17px;color:#475569;max-width:500px;margin:0 auto 40px;line-height:1.7;animation:fadeUp 0.7s ease 0.2s both}
        .hero-ctas{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;animation:fadeUp 0.7s ease 0.3s both}
        .cta-main{padding:14px 32px;border-radius:24px;background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;border:none;font-size:15px;font-weight:600;cursor:pointer;box-shadow:0 8px 24px rgba(99,102,241,0.35);transition:all 0.25s}
        .cta-main:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(99,102,241,0.45)}
        .cta-wa{padding:14px 28px;border-radius:24px;background:rgba(255,255,255,0.7);border:0.5px solid rgba(37,162,68,0.3);color:#16a34a;font-size:15px;font-weight:500;cursor:pointer;backdrop-filter:blur(12px);transition:all 0.25s;display:flex;align-items:center;gap:8px;text-decoration:none}
        .cta-wa:hover{background:rgba(255,255,255,0.9);transform:translateY(-2px)}

        .mockup-wrap{position:relative;z-index:1;margin:0 auto 60px;max-width:720px;padding:0 40px;animation:fadeUp 0.8s ease 0.4s both}
        .mockup-browser{background:rgba(255,255,255,0.7);backdrop-filter:blur(20px);border:0.5px solid rgba(255,255,255,0.9);border-radius:16px;overflow:hidden;box-shadow:0 24px 80px rgba(99,102,241,0.15),0 8px 32px rgba(0,0,0,0.08);transform:perspective(1200px) rotateX(4deg);transition:transform 0.4s}
        .mockup-browser:hover{transform:perspective(1200px) rotateX(0deg)}
        .browser-bar{background:rgba(248,250,252,0.9);padding:10px 16px;display:flex;align-items:center;gap:10px;border-bottom:0.5px solid rgba(0,0,0,0.06)}
        .browser-dots{display:flex;gap:5px}
        .browser-dot{width:10px;height:10px;border-radius:50%}
        .browser-url{flex:1;background:rgba(0,0,0,0.05);border-radius:8px;padding:4px 12px;font-size:11px;color:#94a3b8;text-align:center}
        .dashboard-preview{display:flex;height:260px}
        .preview-sidebar{width:140px;background:rgba(255,255,255,0.8);border-right:0.5px solid rgba(0,0,0,0.05);padding:16px 12px;flex-shrink:0}
        .preview-logo{font-size:11px;font-weight:700;color:#1e3a5f;margin-bottom:16px;padding-bottom:12px;border-bottom:0.5px solid rgba(0,0,0,0.06)}
        .preview-logo span{display:block;font-size:9px;color:#94a3b8;font-weight:400}
        .preview-nav-item{padding:7px 10px;border-radius:8px;font-size:10px;color:#475569;margin-bottom:3px;cursor:pointer;transition:all 0.2s}
        .preview-nav-item.active{background:#eff6ff;color:#2563eb;font-weight:500}
        .preview-main{flex:1;padding:16px;background:rgba(248,250,252,0.6);overflow:hidden}
        .preview-title{font-size:13px;font-weight:600;color:#0f172a;margin-bottom:14px}
        .preview-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px}
        .preview-card{background:rgba(255,255,255,0.9);border-radius:8px;padding:8px 10px;border:0.5px solid rgba(0,0,0,0.06)}
        .preview-card-num{font-size:16px;font-weight:700}
        .preview-card-label{font-size:8px;color:#94a3b8;margin-top:2px}
        .preview-table-head{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:6px;padding:6px 8px;background:rgba(241,245,249,0.8);border-radius:6px;margin-bottom:4px}
        .preview-th{font-size:8px;color:#94a3b8;font-weight:500}
        .preview-row{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:6px;padding:5px 8px;border-radius:6px;transition:background 0.2s}
        .preview-row:hover{background:rgba(239,246,255,0.8)}
        .preview-td{font-size:9px;color:#475569}
        .badge-h{background:#dcfce7;color:#16a34a;padding:1px 6px;border-radius:4px;font-size:8px;font-weight:500}
        .badge-s{background:#fef9c3;color:#ca8a04;padding:1px 6px;border-radius:4px;font-size:8px;font-weight:500}
        .badge-a{background:#fee2e2;color:#dc2626;padding:1px 6px;border-radius:4px;font-size:8px;font-weight:500}

        .float-badges{position:relative;z-index:1;display:flex;justify-content:center;gap:16px;margin-top:-20px;margin-bottom:50px;flex-wrap:wrap;padding:0 40px}
        .float-b{background:rgba(255,255,255,0.7);backdrop-filter:blur(16px);border:0.5px solid rgba(255,255,255,0.9);border-radius:14px;padding:10px 16px;font-size:12px;color:#334155;display:flex;align-items:center;gap:8px;box-shadow:0 4px 16px rgba(0,0,0,0.06);animation:floatUp 3s ease-in-out infinite}
        .float-b:nth-child(2){animation-delay:1s}
        .float-b:nth-child(3){animation-delay:2s}
        @keyframes floatUp{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        .float-icon{font-size:18px}

        .stats{position:relative;z-index:1;display:flex;justify-content:center;gap:0;margin:0 40px 60px;border-radius:20px;overflow:hidden;background:rgba(255,255,255,0.55);backdrop-filter:blur(20px);border:0.5px solid rgba(255,255,255,0.85);box-shadow:0 8px 32px rgba(99,102,241,0.08)}
        .stat{flex:1;padding:24px 20px;text-align:center;border-right:0.5px solid rgba(0,0,0,0.06);transition:background 0.2s}
        .stat:last-child{border-right:none}
        .stat:hover{background:rgba(255,255,255,0.5)}
        .stat-n{font-size:28px;font-weight:700;color:#1e3a5f;line-height:1}
        .stat-l{font-size:11px;color:#94a3b8;margin-top:4px}

        .section{position:relative;z-index:1;padding:40px 40px 60px;scroll-margin-top:55px}
        .sec-label{font-size:11px;font-weight:600;color:#6366f1;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:8px}
        .sec-title{font-size:28px;font-weight:700;color:#0f172a;margin-bottom:8px;letter-spacing:-0.5px}
        .sec-sub{font-size:14px;color:#64748b;margin-bottom:36px;line-height:1.6}

        .feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
        .feat-card{background:rgba(255,255,255,0.6);backdrop-filter:blur(16px);border:0.5px solid rgba(255,255,255,0.9);border-radius:20px;padding:24px;box-shadow:0 4px 20px rgba(0,0,0,0.04);transition:all 0.3s}
        .feat-card:hover{transform:translateY(-4px);box-shadow:0 12px 36px rgba(99,102,241,0.12);background:rgba(255,255,255,0.8)}
        .feat-icon{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:14px;transition:transform 0.3s}
        .feat-card:hover .feat-icon{transform:scale(1.1) rotate(-5deg)}
        .feat-title{font-size:14px;font-weight:600;color:#0f172a;margin-bottom:6px}
        .feat-desc{font-size:12px;color:#64748b;line-height:1.65}

        .vs-wrap{display:grid;grid-template-columns:1fr 1fr;gap:20px}
        .vs-card{border-radius:20px;padding:24px;border:0.5px solid}
        .vs-old{background:rgba(254,242,242,0.7);border-color:rgba(239,68,68,0.2);backdrop-filter:blur(12px)}
        .vs-new{background:rgba(239,246,255,0.7);border-color:rgba(59,130,246,0.2);backdrop-filter:blur(12px)}
        .vs-head{display:flex;align-items:center;gap:10px;margin-bottom:18px}
        .vs-tag{font-size:10px;font-weight:600;padding:3px 10px;border-radius:10px}
        .vs-tag-old{background:rgba(239,68,68,0.12);color:#dc2626}
        .vs-tag-new{background:rgba(59,130,246,0.12);color:#2563eb}
        .vs-item{display:flex;align-items:flex-start;gap:8px;margin-bottom:10px;font-size:12px}
        .vs-x{color:#ef4444;font-size:14px;flex-shrink:0;margin-top:1px}
        .vs-check{color:#22c55e;font-size:14px;flex-shrink:0;margin-top:1px}

        .steps-wrap{display:flex;gap:0;position:relative}
        .step-card{flex:1;text-align:center;padding:28px 20px;background:rgba(255,255,255,0.55);backdrop-filter:blur(16px);border:0.5px solid rgba(255,255,255,0.85);position:relative;transition:all 0.3s}
        .step-card:first-child{border-radius:20px 0 0 20px}
        .step-card:last-child{border-radius:0 20px 20px 0}
        .step-card+.step-card{border-left:none}
        .step-card:hover{background:rgba(255,255,255,0.8);transform:translateY(-4px);z-index:2;border-radius:20px;box-shadow:0 12px 32px rgba(99,102,241,0.12)}
        .step-num{width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;font-size:16px;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;box-shadow:0 4px 14px rgba(99,102,241,0.3)}
        .step-title{font-size:14px;font-weight:600;color:#0f172a;margin-bottom:6px}
        .step-desc{font-size:11px;color:#64748b;line-height:1.6}

        .faq-list{display:flex;flex-direction:column;gap:10px;max-width:640px;margin:0 auto}
        .faq-item{background:rgba(255,255,255,0.6);backdrop-filter:blur(16px);border:0.5px solid rgba(255,255,255,0.9);border-radius:14px;overflow:hidden}
        .faq-q{padding:16px 20px;font-size:13px;font-weight:500;color:#1e3a5f;cursor:pointer;display:flex;justify-content:space-between;align-items:center;transition:background 0.2s;user-select:none;background:none;border:none;width:100%;text-align:left}
        .faq-q:hover{background:rgba(255,255,255,0.5)}
        .faq-arrow{font-size:16px;transition:transform 0.3s;color:#6366f1}
        .faq-a{max-height:0;overflow:hidden;transition:max-height 0.35s ease,padding 0.35s ease;font-size:12px;color:#64748b;line-height:1.7;padding:0 20px}
        .faq-item.open .faq-a{max-height:120px;padding:0 20px 16px}
        .faq-item.open .faq-arrow{transform:rotate(180deg)}

        .pricing-outer{padding:80px 40px 60px;position:relative;z-index:1;scroll-margin-top:55px}
        .pricing-header{text-align:center;margin-bottom:48px}
        .pricing-eyebrow{font-size:11px;font-weight:600;color:#6366f1;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:12px}
        .pricing-title{font-size:36px;font-weight:700;color:#0f172a;letter-spacing:-0.5px;margin-bottom:10px}
        .pricing-sub{font-size:15px;color:#64748b}
        .pricing-toggle{display:inline-flex;background:rgba(255,255,255,0.6);border:0.5px solid rgba(255,255,255,0.9);border-radius:40px;padding:4px;gap:4px;margin-top:20px;backdrop-filter:blur(12px)}
        .pricing-toggle-btn{padding:8px 20px;border-radius:32px;border:none;font-size:13px;font-weight:500;cursor:pointer;transition:all 0.2s;background:transparent;color:#64748b}
        .pricing-toggle-btn.active{background:#6366f1;color:#fff;box-shadow:0 4px 12px rgba(99,102,241,0.3)}
        .pricing-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;max-width:1100px;margin:0 auto}
        .pricing-card{background:rgba(255,255,255,0.65);backdrop-filter:blur(24px);border:0.5px solid rgba(255,255,255,0.9);border-radius:24px;padding:32px 24px;position:relative;box-shadow:0 8px 32px rgba(99,102,241,0.08);transition:transform 0.2s,box-shadow 0.2s}
        .pricing-card:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(99,102,241,0.14)}
        .pricing-card.popular{border:1.5px solid #6366f1;box-shadow:0 8px 40px rgba(99,102,241,0.2)}
        .pricing-badge{position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:#6366f1;color:#fff;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:4px 14px;border-radius:20px;white-space:nowrap}
        .pricing-plan{font-size:13px;font-weight:600;color:#6366f1;letter-spacing:0.05em;text-transform:uppercase;margin-bottom:8px}
        .pricing-price{font-size:30px;font-weight:800;color:#0f172a;letter-spacing:-1px;line-height:1}
        .pricing-price span{font-size:14px;font-weight:400;color:#94a3b8}
        .pricing-price-custom{font-size:22px;font-weight:700;color:#0f172a;margin-top:4px}
        .pricing-quota{font-size:13px;color:#64748b;margin:10px 0 20px;padding-bottom:20px;border-bottom:1px solid rgba(0,0,0,0.06)}
        .pricing-feats{display:flex;flex-direction:column;gap:8px;margin-bottom:24px}
        .pricing-feat{display:flex;align-items:center;gap:8px;font-size:12px;color:#334155}
        .pricing-feat-check{width:16px;height:16px;border-radius:50%;background:linear-gradient(135deg,#4ade80,#22c55e);display:flex;align-items:center;justify-content:center;color:#fff;font-size:9px;flex-shrink:0}
        .pricing-cta{width:100%;padding:12px;border-radius:16px;font-size:13px;font-weight:600;cursor:pointer;border:none;transition:all 0.2s;text-decoration:none;display:block;text-align:center}
        .pricing-cta-primary{background:#6366f1;color:#fff;box-shadow:0 4px 16px rgba(99,102,241,0.3)}
        .pricing-cta-primary:hover{background:#4f46e5;box-shadow:0 6px 20px rgba(99,102,241,0.4)}
        .pricing-cta-outline{background:transparent;color:#6366f1;border:1.5px solid #6366f1 !important}
        .pricing-cta-outline:hover{background:#6366f1;color:#fff}
        .pricing-note{text-align:center;margin-top:20px;font-size:12px;color:#94a3b8}
        .order-outer{text-align:center;padding:80px 40px 60px;position:relative;z-index:1}
        .order-card{background:rgba(255,255,255,0.65);backdrop-filter:blur(24px);border:0.5px solid rgba(255,255,255,0.9);border-radius:28px;padding:48px 40px;max-width:560px;margin:0 auto;box-shadow:0 16px 60px rgba(99,102,241,0.12)}
        .order-eyebrow{font-size:11px;font-weight:600;color:#6366f1;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:16px}
        .order-title{font-size:32px;font-weight:700;color:#0f172a;margin-bottom:8px;letter-spacing:-0.5px}
        .order-sub{font-size:14px;color:#64748b;margin-bottom:32px}
        .order-feats{display:flex;flex-direction:column;gap:10px;text-align:left;margin-bottom:32px}
        .order-feat{display:flex;align-items:center;gap:10px;font-size:13px;color:#334155}
        .check-circle{width:20px;height:20px;border-radius:50%;background:linear-gradient(135deg,#4ade80,#22c55e);display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;flex-shrink:0}
        .btn-wa-big{width:100%;padding:16px;border-radius:22px;background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;border:none;font-size:15px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 8px 24px rgba(34,197,94,0.35);transition:all 0.25s;margin-bottom:14px;text-decoration:none}
        .btn-wa-big:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(34,197,94,0.45)}
        .order-note{font-size:11px;color:#94a3b8}

        .footer{position:relative;z-index:1;padding:28px 40px;background:rgba(255,255,255,0.45);backdrop-filter:blur(16px);border-top:0.5px solid rgba(255,255,255,0.7);display:flex;justify-content:space-between;align-items:center}
        .footer-brand{font-size:14px;font-weight:600;color:#1e3a5f}
        .footer-brand span{font-weight:400;color:#94a3b8}
        .footer-copy{font-size:11px;color:#94a3b8}

        /* Sticky WA button mobile */
        .sticky-wa{display:none;position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:200;background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;border:none;border-radius:28px;padding:13px 24px;font-size:14px;font-weight:600;cursor:pointer;box-shadow:0 8px 28px rgba(34,197,94,0.4);align-items:center;gap:8px;white-space:nowrap;text-decoration:none;transition:all 0.25s}
        .sticky-wa:hover{transform:translateX(-50%) translateY(-2px);box-shadow:0 12px 36px rgba(34,197,94,0.5)}

        /* Scroll to top button */
        .to-top-btn{position:fixed;bottom:24px;right:24px;z-index:200;width:44px;height:44px;border-radius:50%;border:0.5px solid rgba(100,120,200,0.25);background:rgba(255,255,255,0.75);backdrop-filter:blur(16px);color:#3b5a8a;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,0.1);opacity:0;visibility:hidden;transform:translateY(8px);transition:all 0.25s}
        .to-top-btn.visible{opacity:1;visibility:visible;transform:translateY(0)}
        .to-top-btn:hover{background:rgba(255,255,255,0.95);transform:translateY(-2px);box-shadow:0 8px 24px rgba(59,130,246,0.25);color:#3b82f6}

        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeDown{from{opacity:0;transform:translateY(-16px)}to{opacity:1;transform:translateY(0)}}
        .reveal{opacity:0;transform:translateY(28px);transition:opacity 0.6s ease,transform 0.6s ease}
        .reveal.visible{opacity:1;transform:translateY(0)}

        @media(max-width:768px){
          .sticky-wa{display:flex}
          .nav-links{display:none}
          .hero h1{font-size:34px}
          .hero{padding:60px 20px 40px}
          .mockup-wrap{padding:0 16px}
          .float-badges{padding:0 16px;gap:8px}
          .float-b{font-size:11px;padding:8px 12px}
          .stats{margin:0 16px 40px;flex-wrap:wrap}
          .stat{min-width:50%;border-right:none;border-bottom:0.5px solid rgba(0,0,0,0.06)}
          .section{padding:60px 20px 48px}
          .feat-grid{grid-template-columns:1fr}
          .vs-wrap{grid-template-columns:1fr}
          .steps-wrap{flex-direction:column}
          .step-card:first-child{border-radius:20px 20px 0 0}
          .step-card:last-child{border-radius:0 0 20px 20px}
          .step-card+.step-card{border-left:0.5px solid rgba(255,255,255,0.85);border-top:none}
          .pricing-outer{padding:48px 20px 40px}
          .pricing-grid{grid-template-columns:1fr 1fr;gap:12px}
          .pricing-title{font-size:26px}
          .order-outer{padding:60px 16px 80px}
          .order-card{padding:32px 20px}
          .order-title{font-size:24px}
          .footer{flex-direction:column;gap:8px;text-align:center;padding:20px}
          .nav{padding:12px 20px}
          .nav-actions .btn-ghost{display:none}
          .btn-primary{font-size:12px;padding:6px 14px}
        }
      `}</style>

      {/* Blobs */}
      <div className="blob blob1" />
      <div className="blob blob2" />
      <div className="blob blob3" />

      {/* Sticky WA button (mobile only) */}
      <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="sticky-wa">
        <svg style={{ width: 18, height: 18, fill: "#fff" }} viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12.004 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.985-1.306A9.953 9.953 0 0012.004 22C17.53 22 22 17.523 22 12S17.53 2 12.004 2z" />
        </svg>
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

      <div>
        {/* Navbar */}
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

        {/* Hero */}
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
            Platform absensi harian digital untuk sekolah — input mudah oleh sekretaris, rekap otomatis, bisa diakses kapan saja dari browser.
          </p>
          <div className="hero-ctas">
            <button className="cta-main" onClick={() => scrollToSection("fitur")}>
              Lihat Fitur ↓
            </button>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="cta-wa">
              <svg style={{ width: 18, height: 18, fill: "#16a34a" }} viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12.004 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.985-1.306A9.953 9.953 0 0012.004 22C17.53 22 22 17.523 22 12S17.53 2 12.004 2z" />
              </svg>
              Pesan via WhatsApp
            </a>
          </div>
        </div>

        {/* Mockup */}
        <div className="mockup-wrap reveal" id="mockup">
          <div className="mockup-browser">
            <div className="browser-bar">
              <div className="browser-dots">
                <div className="browser-dot" style={{ background: "#ff5f57" }} />
                <div className="browser-dot" style={{ background: "#febc2e" }} />
                <div className="browser-dot" style={{ background: "#28c840" }} />
              </div>
              <div className="browser-url">absenku</div>
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
                <div className="preview-title">Overview</div>
                <div className="preview-cards">
                  <div className="preview-card">
                    <div className="preview-card-num" style={{ color: "#3b82f6" }} id="c1">0</div>
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
                <div className="preview-row">
                  <div className="preview-td">Aditya Pratama</div>
                  <div className="preview-td">X RPL 1</div>
                  <div className="preview-td"><span className="badge-h">Hadir</span></div>
                  <div className="preview-td">07:12</div>
                </div>
                <div className="preview-row">
                  <div className="preview-td">Siti Rahayu</div>
                  <div className="preview-td">XI TKJ</div>
                  <div className="preview-td"><span className="badge-s">Sakit</span></div>
                  <div className="preview-td">07:30</div>
                </div>
                <div className="preview-row">
                  <div className="preview-td">Budi Santoso</div>
                  <div className="preview-td">XII AK</div>
                  <div className="preview-td"><span className="badge-h">Hadir</span></div>
                  <div className="preview-td">07:08</div>
                </div>
                <div className="preview-row">
                  <div className="preview-td">Dewi Lestari</div>
                  <div className="preview-td">X RPL 2</div>
                  <div className="preview-td"><span className="badge-a">Alpa</span></div>
                  <div className="preview-td">—</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Float badges */}
        <div className="float-badges reveal">
          <div className="float-b"><span className="float-icon">✅</span>Input absensi &lt; 2 menit</div>
          <div className="float-b"><span className="float-icon">📊</span>Rekap otomatis real-time</div>
          <div className="float-b"><span className="float-icon">🔒</span>Data aman &amp; terenkripsi</div>
        </div>

        {/* Stats */}
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

        {/* Features */}
        <div className="section reveal" id="fitur">
          <div className="sec-label">Fitur utama</div>
          <div className="sec-title">Semua yang dibutuhkan sekolah</div>
          <div className="sec-sub">Dirancang khusus untuk alur kerja absensi harian — simple, cepat, dan akurat.</div>
          <div className="feat-grid">
            {[
              { icon: "📋", bg: "rgba(59,130,246,0.12)", title: "Input absensi harian", desc: "Sekretaris kelas input H/S/I/A dengan cepat. Ada jam lock otomatis sesuai jam yang dikonfigurasi sekolah." },
              { icon: "📊", bg: "rgba(34,197,94,0.12)", title: "Rekap otomatis", desc: "Rekap per siswa, per kelas, dan per semester langsung tersedia tanpa hitung manual lagi." },
              { icon: "👥", bg: "rgba(139,92,246,0.12)", title: "4 level akses", desc: "Developer, Admin Sekolah, Sekretaris Kelas, Wali Kelas — masing-masing punya dashboard & akses sendiri." },
              { icon: "🏫", bg: "rgba(245,158,11,0.12)", title: "Multi-sekolah", desc: "Satu platform untuk banyak sekolah. Data tiap sekolah terisolasi, aman, dan tidak bercampur." },
              { icon: "📄", bg: "rgba(239,68,68,0.12)", title: "Export & cetak PDF", desc: "Ekspor rekap absensi ke PDF. Bisa cetak form absensi fisik langsung dari sistem kapan saja." },
              { icon: "⚙️", bg: "rgba(20,184,166,0.12)", title: "Konfigurasi fleksibel", desc: "Jam lock absensi, batas alpa, zona waktu bisa diatur sendiri oleh admin per sekolah." },
            ].map((f, i) => (
              <div className="feat-card reveal" key={i}>
                <div className="feat-icon" style={{ background: f.bg }}>{f.icon}</div>
                <div className="feat-title">{f.title}</div>
                <div className="feat-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* VS */}
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
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#2563eb" }}>absenku</div>
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

        {/* How it works */}
        <div className="section reveal" id="cara-kerja">
          <div className="sec-label">Cara kerja</div>
          <div className="sec-title">Mulai dalam 3 langkah</div>
          <div className="sec-sub" style={{ marginBottom: 24 }}>Tidak perlu install apapun. Langsung pakai dari browser.</div>
          <div className="steps-wrap">
            {[
              { n: 1, title: "Hubungi kami", desc: "Chat via WhatsApp. Kami siapkan akun sekolah & Admin dalam hitungan menit." },
              { n: 2, title: "Setup sekolah", desc: "Admin input data kelas, siswa, dan buat akun sekretaris tiap kelas." },
              { n: 3, title: "Mulai absensi", desc: "Sekretaris langsung input absensi harian dari browser. Rekap langsung tersedia." },
            ].map((s) => (
              <div className="step-card" key={s.n}>
                <div className="step-num">{s.n}</div>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="section reveal" id="faq">
          <div className="sec-label">FAQ</div>
          <div className="sec-title" style={{ textAlign: "center" }}>Pertanyaan yang sering ditanyakan</div>
          <div className="sec-sub" style={{ textAlign: "center", marginBottom: 28 }}>
            Ada pertanyaan lain? Chat kami langsung via WhatsApp.
          </div>
          <div className="faq-list">
            {[
              { q: "Apakah bisa diakses dari HP?", a: "Ya, absenku berbasis web dan responsif. Bisa diakses dari HP, tablet, maupun laptop — cukup buka browser, tidak perlu install aplikasi." },
              { q: "Data absensi aman tidak?", a: "Sangat aman. Data disimpan di cloud dengan enkripsi, dan tiap sekolah memiliki data yang terisolasi. Tidak ada sekolah lain yang bisa melihat data sekolah Anda." },
              { q: "Berapa sekolah yang sudah pakai?", a: "Saat ini absenku sedang dalam tahap MVP dan digunakan di sekolah kami sendiri sebagai beta tester. Kami membuka pendaftaran untuk sekolah-sekolah awal yang ingin bergabung." },
              { q: "Siapa yang input absensi dan bagaimana caranya?", a: "Absensi harian diinput oleh Petugas Absensi — satu orang per kelas, bisa sekretaris kelas atau wali kelas. Akunnya dibuat oleh Admin Sekolah melalui dashboard, tidak ada self-register. Petugas cukup buka browser, login, lalu input status H/S/I/A tiap siswa. Ada jam lock otomatis sesuai konfigurasi sekolah." },
              { q: "Apakah ada masa percobaan gratis?", a: "Hubungi kami via WhatsApp untuk info trial dan harga. Kami terbuka untuk diskusi sesuai kebutuhan dan jumlah kelas di sekolah Anda." },
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

        {/* Harga */}
        <div className="pricing-outer reveal" id="harga">
          <div className="pricing-header">
            <div className="pricing-eyebrow">Harga</div>
            <div className="pricing-title">Pilih paket yang sesuai</div>
            <div className="pricing-sub">Semua fitur tersedia di setiap paket. Beda hanya di jumlah kelas.</div>
            <div className="pricing-toggle">
              <button
                className={"pricing-toggle-btn" + (pricingPeriod === "bulanan" ? " active" : "")}
                onClick={() => setPricingPeriod("bulanan")}
              >Bulanan</button>
              <button
                className={"pricing-toggle-btn" + (pricingPeriod === "tahunan" ? " active" : "")}
                onClick={() => setPricingPeriod("tahunan")}
              >Tahunan <span style={{color: pricingPeriod === "tahunan" ? "#a5f3b4" : "#22c55e", fontSize: 11}}>-15%</span></button>
            </div>
          </div>
          <div className="pricing-grid">
            {[
              { plan: "Starter", quota: "s/d 6 kelas", monthly: 59000, yearly: 599000, popular: false },
              { plan: "Basic", quota: "s/d 12 kelas", monthly: 99000, yearly: 999000, popular: false },
              { plan: "Pro", quota: "s/d 24 kelas", monthly: 169000, yearly: 1699000, popular: true },
              { plan: "Enterprise", quota: "Unlimited kelas", monthly: null, yearly: null, popular: false },
            ].map((p) => (
              <div className={"pricing-card" + (p.popular ? " popular" : "")} key={p.plan}>
                {p.popular && <div className="pricing-badge">⭐ Terpopuler</div>}
                <div className="pricing-plan">{p.plan}</div>
                {p.monthly ? (
                  <div className="pricing-price">
                    Rp {(pricingPeriod === "bulanan" ? p.monthly : Math.round(p.yearly! / 12)).toLocaleString("id-ID")}
                    <span>/bln</span>
                    {pricingPeriod === "tahunan" && (
                      <div style={{fontSize: 11, color: "#22c55e", fontWeight: 500, marginTop: 2}}>
                        Rp {p.yearly!.toLocaleString("id-ID")}/tahun
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="pricing-price-custom">Hubungi kami</div>
                )}
                <div className="pricing-quota">{p.quota}</div>
                <div className="pricing-feats">
                  {["Input absensi harian", "Rekap otomatis", "Export & cetak PDF", "Konfigurasi jam lock"].map((f) => (
                    <div className="pricing-feat" key={f}>
                      <div className="pricing-feat-check">✓</div>
                      {f}
                    </div>
                  ))}
                </div>
                <a
                  href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Halo Haruki, saya tertarik dengan paket ${p.plan} absenku. Boleh info lebih lanjut?`)}`}
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

        {/* Order / CTA */}
        <div className="order-outer reveal" id="mulai">
          <div className="order-card">
            <div className="order-eyebrow">Mulai sekarang</div>
            <div className="order-title">Siap digitalkan absensi sekolahmu?</div>
            <div className="order-sub">Hubungi kami via WhatsApp untuk info harga, demo, dan setup langsung.</div>
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

        {/* Footer */}
        <div className="footer">
          <div className="footer-brand">absenku <span>by KiharuWorks</span></div>
          <div className="footer-copy">© 2026 KiharuWorks. Dibuat dengan ❤️ di Indonesia.</div>
        </div>
      </div>
    </>
  );
}

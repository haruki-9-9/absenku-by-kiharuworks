import LoginForm from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div
      className="relative min-h-screen overflow-hidden text-white"
      style={{ background: "#0a0f1e" }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full blur-[120px]"
        style={{ background: "radial-gradient(ellipse, rgba(59,130,246,0.10) 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full blur-[100px]"
        style={{ background: "radial-gradient(ellipse, rgba(59,130,246,0.05) 0%, transparent 70%)" }}
      />

      {/* Top bar */}
      <div className="relative z-10 flex items-center px-6 py-5 sm:px-10">
        <span className="text-sm font-bold tracking-wide text-white">
          absenku{" "}
          <span className="text-slate-500 font-normal">by KiharuWorks</span>
        </span>
      </div>

      {/* Main card */}
      <div className="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center px-6 pb-16">
        <div className="w-full max-w-sm">
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-slate-900/60 p-8 shadow-2xl backdrop-blur-sm">
            {/* Corner glow */}
            <div
              className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl"
              style={{ background: "rgba(59,130,246,0.12)" }}
            />

            {/* Header */}
            <div className="relative mb-8">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-400/10">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-blue-400">
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-400/80">
                absenku · by KiharuWorks
              </p>
              <h1 className="mt-1.5 text-2xl font-extrabold text-white">
                Login
              </h1>
              <p className="mt-1.5 text-sm leading-6 text-slate-500">
                Masuk untuk mengakses sistem absensi sekolah.
              </p>
            </div>

            <LoginForm />
          </div>

          <p className="mt-5 text-center text-[11px] text-slate-600">
            Hubungi admin sekolah jika tidak bisa masuk.
          </p>
        </div>
      </div>
    </div>
  );
}

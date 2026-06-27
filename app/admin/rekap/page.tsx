"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Kelas {
  id: string;
  nama: string;
}

interface Semester {
  id: string;
  nama: string;
  tanggalMulai: string;
  tanggalSelesai: string;
}

interface TahunAjaran {
  id: string;
  nama: string;
  semester: Semester[];
}

const BULAN = [
  { value: "1", label: "Januari" },
  { value: "2", label: "Februari" },
  { value: "3", label: "Maret" },
  { value: "4", label: "April" },
  { value: "5", label: "Mei" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "Agustus" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

export default function RekapPage() {
  const router = useRouter();
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [tahunAjaranList, setTahunAjaranList] = useState<TahunAjaran[]>([]);
  const [loading, setLoading] = useState(true);

  const [jenis, setJenis] = useState<"bulanan" | "semester">("bulanan");
  const [kelasId, setKelasId] = useState("");
  const [bulan, setBulan] = useState(String(new Date().getMonth() + 1));
  const [tahun, setTahun] = useState(String(new Date().getFullYear()));
  const [semesterId, setSemesterId] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/rekap/kelas").then((r) => r.json()),
      fetch("/api/rekap/tahun-ajaran").then((r) => r.json()),
    ]).then(([kelas, ta]) => {
      setKelasList(kelas);
      setTahunAjaranList(ta);
      if (kelas.length > 0) setKelasId(kelas[0].id);
      // set default semester: semester aktif pertama
      const allSem = ta.flatMap((t: TahunAjaran) => t.semester);
      if (allSem.length > 0) setSemesterId(allSem[0].id);
      setLoading(false);
    });
  }, []);

  const handleLihat = () => {
    if (!kelasId) return;
    if (jenis === "bulanan") {
      router.push(`/admin/rekap/bulanan?kelasId=${kelasId}&bulan=${bulan}&tahun=${tahun}`);
    } else {
      if (!semesterId) return;
      router.push(`/admin/rekap/semester?kelasId=${kelasId}&semesterId=${semesterId}`);
    }
  };

  const selectStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    border: "0.5px solid rgba(99,102,241,0.25)",
    background: "rgba(255,255,255,0.8)",
    fontSize: 13,
    color: "#0f172a",
    outline: "none",
    cursor: "pointer",
    appearance: "none" as const,
    WebkitAppearance: "none" as const,
  };

  const labelStyle = {
    fontSize: 11,
    fontWeight: 700 as const,
    color: "#64748b",
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    marginBottom: 6,
    display: "block",
  };

  const tahunOptions = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - 2 + i));

  return (
    <>
      <style>{`
        .rekap-tab:hover { background: rgba(99,102,241,0.06) !important; }
        .rekap-tab.active { background: linear-gradient(135deg,#6366f1,#8b5cf6) !important; color: #fff !important; box-shadow: 0 4px 14px rgba(99,102,241,0.3); }
        .btn-lihat:hover { opacity: 0.9; transform: translateY(-1px); }
        select:focus { border-color: rgba(99,102,241,0.5) !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 560 }}>
        {/* Header */}
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
            Rekap Absensi
          </h1>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
            Pilih kelas dan periode untuk melihat rekap absensi.
          </p>
        </div>

        {loading ? (
          <div style={{
            background: "rgba(255,255,255,0.65)", backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)", border: "0.5px solid rgba(255,255,255,0.9)",
            borderRadius: 20, padding: 48, textAlign: "center",
            boxShadow: "0 8px 32px rgba(99,102,241,0.08)",
          }}>
            <p style={{ fontSize: 13, color: "#94a3b8" }}>Memuat data...</p>
          </div>
        ) : kelasList.length === 0 ? (
          <div style={{
            background: "rgba(255,255,255,0.65)", backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)", border: "0.5px solid rgba(255,255,255,0.9)",
            borderRadius: 20, padding: 48, textAlign: "center",
            boxShadow: "0 8px 32px rgba(99,102,241,0.08)",
          }}>
            <p style={{ fontSize: 13, color: "#94a3b8" }}>Belum ada kelas aktif. Tambah kelas terlebih dahulu.</p>
          </div>
        ) : (
          <div style={{
            background: "rgba(255,255,255,0.65)", backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)", border: "0.5px solid rgba(255,255,255,0.9)",
            borderRadius: 20, padding: 28, boxShadow: "0 8px 32px rgba(99,102,241,0.08)",
            display: "flex", flexDirection: "column", gap: 22,
          }}>

            {/* Pilih jenis rekap */}
            <div>
              <span style={labelStyle}>Jenis Rekap</span>
              <div style={{ display: "flex", gap: 8 }}>
                {(["bulanan", "semester"] as const).map((j) => (
                  <button
                    key={j}
                    className={`rekap-tab${jenis === j ? " active" : ""}`}
                    onClick={() => setJenis(j)}
                    style={{
                      flex: 1, padding: "10px 0", borderRadius: 10,
                      border: "0.5px solid rgba(99,102,241,0.2)",
                      background: "transparent", fontSize: 13, fontWeight: 600,
                      color: jenis === j ? "#fff" : "#475569",
                      cursor: "pointer", transition: "all 0.2s",
                    }}
                  >
                    {j === "bulanan" ? "Per Bulan" : "Per Semester"}
                  </button>
                ))}
              </div>
            </div>

            {/* Pilih kelas */}
            <div>
              <label style={labelStyle}>Kelas</label>
              <div style={{ position: "relative" }}>
                <select value={kelasId} onChange={(e) => setKelasId(e.target.value)} style={selectStyle}>
                  {kelasList.map((k) => (
                    <option key={k.id} value={k.id}>{k.nama}</option>
                  ))}
                </select>
                <svg style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                  viewBox="0 0 20 20" fill="#94a3b8" width={14} height={14}>
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Pilih periode */}
            {jenis === "bulanan" ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Bulan</label>
                  <div style={{ position: "relative" }}>
                    <select value={bulan} onChange={(e) => setBulan(e.target.value)} style={selectStyle}>
                      {BULAN.map((b) => (
                        <option key={b.value} value={b.value}>{b.label}</option>
                      ))}
                    </select>
                    <svg style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                      viewBox="0 0 20 20" fill="#94a3b8" width={14} height={14}>
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Tahun</label>
                  <div style={{ position: "relative" }}>
                    <select value={tahun} onChange={(e) => setTahun(e.target.value)} style={selectStyle}>
                      {tahunOptions.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <svg style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                      viewBox="0 0 20 20" fill="#94a3b8" width={14} height={14}>
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label style={labelStyle}>Semester</label>
                <div style={{ position: "relative" }}>
                  <select value={semesterId} onChange={(e) => setSemesterId(e.target.value)} style={selectStyle}>
                    {tahunAjaranList.map((ta) =>
                      ta.semester.map((sem) => (
                        <option key={sem.id} value={sem.id}>
                          {sem.nama} — {ta.nama}
                        </option>
                      ))
                    )}
                  </select>
                  <svg style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                    viewBox="0 0 20 20" fill="#94a3b8" width={14} height={14}>
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}

            {/* Tombol */}
            <button
              className="btn-lihat"
              onClick={handleLihat}
              disabled={!kelasId || (jenis === "semester" && !semesterId)}
              style={{
                width: "100%", padding: "12px 0", borderRadius: 12, border: "none",
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
                transition: "all 0.2s", opacity: (!kelasId || (jenis === "semester" && !semesterId)) ? 0.5 : 1,
              }}
            >
              Lihat Rekap
            </button>
          </div>
        )}
      </div>
    </>
  );
}

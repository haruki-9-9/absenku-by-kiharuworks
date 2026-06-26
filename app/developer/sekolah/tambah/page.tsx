import TambahSekolahForm from "@/components/developer/TambahSekolahForm";

export default function TambahSekolahPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
          Tambah Sekolah
        </h1>
        <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>
          Daftarkan sekolah baru beserta akun Admin Sekolah.
        </p>
      </div>
      <TambahSekolahForm />
    </div>
  );
}

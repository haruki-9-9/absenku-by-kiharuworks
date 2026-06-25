import TambahSekolahForm from "@/components/developer/TambahSekolahForm";

export default function TambahSekolahPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Tambah Sekolah</h1>
        <p className="text-sm text-slate-500">
          Daftarkan sekolah baru beserta akun Admin Sekolah.
        </p>
      </div>
      <TambahSekolahForm />
    </div>
  );
}

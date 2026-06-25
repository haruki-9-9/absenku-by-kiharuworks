import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getAllSekolah() {
  return prisma.sekolah.findMany({
    include: {
      langganan: true,
      _count: {
        select: { users: true, kelas: true, siswa: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status) {
    return (
      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
        Belum ada langganan
      </span>
    );
  }

  const map: Record<string, string> = {
    AKTIF: "bg-emerald-100 text-emerald-700",
    EXPIRED: "bg-red-100 text-red-700",
    NONAKTIF: "bg-slate-100 text-slate-500",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[status] ?? "bg-slate-100 text-slate-500"}`}
    >
      {status}
    </span>
  );
}

export default async function SekolahPage() {
  const sekolahList = await getAllSekolah();

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Manajemen Sekolah</h1>
          <p className="text-sm text-slate-500">
            {sekolahList.length} sekolah terdaftar.
          </p>
        </div>
        <Link
          href="/developer/sekolah/tambah"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-95"
        >
          + Tambah Sekolah
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {sekolahList.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm font-medium text-slate-500">
              Belum ada sekolah terdaftar.
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Klik &quot;Tambah Sekolah&quot; untuk mulai.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left">
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  Nama Sekolah
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  Status
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  Kelas
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  Siswa
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  User
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  Terdaftar
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {sekolahList.map((sekolah) => (
                <tr
                  key={sekolah.id}
                  className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-5 py-3">
                    <p className="text-sm font-semibold text-slate-800">
                      {sekolah.nama}
                    </p>
                    {sekolah.alamat && (
                      <p className="text-xs text-slate-400 truncate max-w-[200px]">
                        {sekolah.alamat}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={sekolah.langganan?.status ?? null} />
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-600">
                    {sekolah._count.kelas}
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-600">
                    {sekolah._count.siswa}
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-600">
                    {sekolah._count.users}
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-400">
                    {new Date(sekolah.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/developer/sekolah/${sekolah.id}`}
                      className="text-xs font-medium text-blue-600 hover:underline"
                    >
                      Detail →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

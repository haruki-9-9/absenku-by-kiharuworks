import { prisma } from "@/lib/prisma";

async function getOverviewData() {
  const [
    totalSekolah,
    sekolahAktif,
    sekolahExpired,
    sekolahNonaktif,
    totalUser,
    sekolahMauHabis,
  ] = await Promise.all([
    prisma.sekolah.count(),
    prisma.langganan.count({ where: { status: "AKTIF" } }),
    prisma.langganan.count({ where: { status: "EXPIRED" } }),
    prisma.langganan.count({ where: { status: "NONAKTIF" } }),
    prisma.user.count({ where: { role: { not: "DEVELOPER" } } }),
    prisma.langganan.findMany({
      where: {
        status: "AKTIF",
        tanggalBerakhir: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          gte: new Date(),
        },
      },
      include: { sekolah: { select: { nama: true } } },
      orderBy: { tanggalBerakhir: "asc" },
    }),
  ]);

  return {
    totalSekolah,
    sekolahAktif,
    sekolahExpired,
    sekolahNonaktif,
    totalUser,
    sekolahMauHabis,
  };
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p className={`mt-2 text-3xl font-extrabold ${color}`}>{value}</p>
    </div>
  );
}

function getDaysLeft(date: Date) {
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default async function DeveloperPage() {
  const data = await getOverviewData();

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">Overview</h1>
        <p className="text-sm text-slate-500">
          Ringkasan seluruh data absenku.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Sekolah"
          value={data.totalSekolah}
          color="text-slate-800"
        />
        <StatCard
          label="Langganan Aktif"
          value={data.sekolahAktif}
          color="text-emerald-600"
        />
        <StatCard
          label="Expired"
          value={data.sekolahExpired}
          color="text-red-500"
        />
        <StatCard
          label="Total User"
          value={data.totalUser}
          color="text-blue-600"
        />
      </div>

      {/* Langganan mau habis */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-800">
            Langganan Mau Habis
          </h2>
          <p className="text-xs text-slate-400">
            Sekolah dengan langganan berakhir dalam 30 hari ke depan.
          </p>
        </div>

        {data.sekolahMauHabis.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-slate-400">
              Tidak ada langganan yang mau habis dalam 30 hari.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 text-left">
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  Sekolah
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  Berakhir
                </th>
                <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  Sisa
                </th>
              </tr>
            </thead>
            <tbody>
              {data.sekolahMauHabis.map((item) => {
                const daysLeft = getDaysLeft(item.tanggalBerakhir);
                return (
                  <tr
                    key={item.id}
                    className="border-b border-slate-50 last:border-0"
                  >
                    <td className="px-5 py-3 text-sm font-medium text-slate-700">
                      {item.sekolah.nama}
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-500">
                      {new Date(item.tanggalBerakhir).toLocaleDateString(
                        "id-ID",
                        { day: "numeric", month: "long", year: "numeric" }
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          daysLeft <= 7
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {daysLeft} hari
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

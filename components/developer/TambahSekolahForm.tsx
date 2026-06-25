"use client";

import { useActionState } from "react";
import { tambahSekolahAction } from "@/app/developer/sekolah/tambah/actions";

const initialState = { success: false, message: "" };

export default function TambahSekolahForm() {
  const [state, formAction, pending] = useActionState(tambahSekolahAction, initialState);

  return (
    <form action={formAction} className="space-y-6 max-w-2xl">
      {state.message && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.message}
        </div>
      )}

      {/* Data Sekolah */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-slate-700">Data Sekolah</h2>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
            Nama Sekolah <span className="text-red-500">*</span>
          </label>
          <input
            name="nama"
            type="text"
            required
            placeholder="SMK Negeri 1 Bandung"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
            Alamat
          </label>
          <input
            name="alamat"
            type="text"
            placeholder="Jl. Contoh No. 1, Bandung"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30"
          />
        </div>
      </div>

      {/* Akun Admin Sekolah */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-slate-700">Akun Admin Sekolah</h2>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
            Nama Admin <span className="text-red-500">*</span>
          </label>
          <input
            name="namaAdmin"
            type="text"
            required
            placeholder="Budi Santoso"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
            Email Admin <span className="text-red-500">*</span>
          </label>
          <input
            name="emailAdmin"
            type="email"
            required
            placeholder="admin@smkn1bandung.sch.id"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
            Password Admin <span className="text-red-500">*</span>
          </label>
          <input
            name="passwordAdmin"
            type="password"
            required
            placeholder="Minimal 8 karakter"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30"
          />
        </div>
      </div>

      {/* Langganan */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-slate-700">Periode Langganan</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
              Tanggal Mulai <span className="text-red-500">*</span>
            </label>
            <input
              name="tanggalMulai"
              type="date"
              required
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
              Tanggal Berakhir <span className="text-red-500">*</span>
            </label>
            <input
              name="tanggalBerakhir"
              type="date"
              required
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60 active:scale-95"
        >
          {pending ? "Menyimpan..." : "Simpan Sekolah"}
        </button>
        <a
          href="/developer/sekolah"
          className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          Batal
        </a>
      </div>
    </form>
  );
}

// src/components/reports/ReportTable.tsx
'use client';

import Link from 'next/link';

type ReportRow = {
  id: string;
  judul: string;
  kategori: string;
  prioritas: string;
  status: string;
  lokasi: string;
  createdAt: string;
};

export function ReportTable({ reports }: { reports: ReportRow[] }) {
  return (
    <div className="mt-3 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80 shadow-[0_24px_80px_rgba(15,23,42,0.9)]">
      
      {/* ✅ scroll horizontal */}
      <div className="w-full overflow-x-auto">
        <table className="w-full table-fixed text-left text-[11px] text-slate-200 sm:text-xs">
  <thead className="bg-slate-900/80 text-[10px] uppercase tracking-wide text-slate-400 sm:text-[11px]">
    <tr>
      <th className="w-[42%] px-2 py-2 sm:px-4 sm:py-3">Judul</th>
      <th className="hidden w-[14%] px-2 py-2 sm:table-cell sm:px-4 sm:py-3">
        Kategori
      </th>
      <th className="hidden w-[14%] px-2 py-2 sm:table-cell sm:px-4 sm:py-3">
        Prioritas
      </th>
      <th className="w-[18%] px-2 py-2 sm:px-4 sm:py-3">Status</th>
      <th className="hidden w-[12%] px-2 py-2 md:table-cell sm:px-4 sm:py-3">
        Lokasi
      </th>
      <th className="w-[22%] px-2 py-2 sm:px-4 sm:py-3">Dibuat</th>
    </tr>
  </thead>

  <tbody>
    {reports.length === 0 ? (
      <tr>
        <td colSpan={6} className="px-3 py-6 text-center text-slate-400">
          Belum ada laporan.
        </td>
      </tr>
    ) : (
      reports.map((r) => (
        <tr key={r.id} className="border-t border-white/5 hover:bg-slate-900/60">
          <td className="px-2 py-2 sm:px-4 sm:py-3 text-slate-100">
            <Link
              href={`/reports/${r.id}`}
              className="block truncate hover:text-emerald-300 hover:underline underline-offset-2"
              title={r.judul}
            >
              {r.judul}
            </Link>
          </td>

          <td className="hidden px-2 py-2 sm:table-cell sm:px-4 sm:py-3 text-slate-300 truncate">
            {r.kategori}
          </td>

          <td className="hidden px-2 py-2 sm:table-cell sm:px-4 sm:py-3 text-slate-300 truncate">
            {r.prioritas}
          </td>

          <td className="px-2 py-2 sm:px-4 sm:py-3 text-slate-300 truncate">
            {r.status}
          </td>

          <td className="hidden px-2 py-2 md:table-cell sm:px-4 sm:py-3 text-slate-300 truncate">
            {r.lokasi}
          </td>

          <td className="px-2 py-2 sm:px-4 sm:py-3 text-slate-400 truncate">
            {new Date(r.createdAt).toLocaleDateString('id-ID')}
          </td>
        </tr>
      ))
    )}
  </tbody>
</table>

      </div>
    </div>
  );
}

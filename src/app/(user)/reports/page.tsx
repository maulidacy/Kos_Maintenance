// src/app/(user)/reports/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ReportTable } from '@/components/reports/ReportTable';

type ReportRow = {
  id: string;
  judul: string;
  kategori: string;
  prioritas: string;
  status: string;
  lokasi: string;
  createdAt: string;
};

type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/reports?mode=strong&page=${page}&limit=10`, {
          credentials: 'include',
        });
        const data = await res.json();

        if (!alive) return;

        setReports(data.reports || []);
        setPagination(data.pagination || null);
      } catch (err) {
        console.error('Fetch reports error:', err);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, [page]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 px-3 py-6">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,#6366f1_0,#020617_55%,#000_100%)] opacity-70" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-4">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold">Laporan Saya</h1>
            <p className="text-xs text-slate-300">
              Klik judul untuk melihat dan mengedit detail laporan.
            </p>
          </div>

          <Link
            href="/reports/new"
            className="inline-flex items-center rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-emerald-600"
          >
            Laporan baru
          </Link>
        </header>

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-xs text-slate-300">
            Memuat laporan...
          </div>
        ) : (
          <>
            <ReportTable reports={reports} />

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-xs text-slate-200">
                <p className="text-slate-300">
                  Halaman {pagination.page} dari {pagination.totalPages} • Total{' '}
                  {pagination.total} laporan
                </p>

                <div className="flex gap-2">
                  <button
                    disabled={!pagination.hasPrev}
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:bg-slate-800 disabled:opacity-50"
                  >
                    Prev
                  </button>

                  <button
                    disabled={!pagination.hasNext}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:bg-slate-800 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

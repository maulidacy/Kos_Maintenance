// src/app/admin/timetime/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';

function diffMinutes(a?: string | null, b?: string | null) {
  if (!a || !b) return null;
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(0, Math.round(ms / 60000));
}

function toDateInputValue(d: Date) {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateShort(value: string) {
  return new Date(value).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

type Summary = {
  range: { from: string; to: string };
  total: number;
  finished: number;
  rejected: number;
  received: number;
  inProgress: number;
  avgResponseMs: number;
  avgWorkMs: number;
  avgTotalMs: number;
};

type Human = {
  avgResponseMin: number;
  avgWorkMin: number;
  avgTotalMin: number;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

type ReportTimeRow = {
  id: string;
  judul: string;
  status: string;

  createdAt?: string | null;
  receivedAt?: string | null;
  startedAt?: string | null;
  resolvedAt?: string | null;
};

export default function AdminTimetimePage() {
  const [reports, setReports] = useState<ReportTimeRow[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [human, setHuman] = useState<Human | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const [page, setPage] = useState(1);
  const LIMIT = 10;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // default range: 7 hari terakhir (UTC)
  const defaultRange = useMemo(() => {
    const now = new Date();
    const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 6));
    return {
      from: toDateInputValue(from),
      to: toDateInputValue(to),
    };
  }, []);

  const [from, setFrom] = useState(defaultRange.from);
  const [to, setTo] = useState(defaultRange.to);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const qs = new URLSearchParams();
      if (from) qs.set('from', from);
      if (to) qs.set('to', to);

      // 1) SUMMARY
      const resSummary = await fetch(`/api/admin/timetime?${qs.toString()}`, {
        credentials: 'include',
      });
      const dataSummary = await resSummary.json();

      if (!resSummary.ok) {
        setError(dataSummary.error || 'Gagal memuat timetime.');
        setReports([]);
        setSummary(null);
        setHuman(null);
        setPagination(null);
        return;
      }

      setSummary(dataSummary.summary || null);
      setHuman(dataSummary.human || null);

      // 2) DETAILS (TABLE + PAGINATION)
      qs.set('page', String(page));
      qs.set('limit', String(LIMIT));

      const resDetails = await fetch(
        `/api/admin/timetime/details?${qs.toString()}`,
        {
          credentials: 'include',
        }
      );
      const dataDetails = await resDetails.json();

      if (!resDetails.ok) {
        setError(dataDetails.error || 'Gagal memuat detail laporan.');
        setReports([]);
        setPagination(null);
        return;
      }

      setReports((dataDetails.reports as ReportTimeRow[]) || []);
      setPagination(dataDetails.pagination || null);

    } catch (e) {
      console.error(e);
      setError('Terjadi kesalahan jaringan.');
      setReports([]);
      setSummary(null);
      setHuman(null);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, page]);

  function setRange(days: number) {
    const now = new Date();
    const toD = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const fromD = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (days - 1)));
    setPage(1);
    setFrom(toDateInputValue(fromD));
    setTo(toDateInputValue(toD));
  }

  function setThisMonth() {
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
    setPage(1);
    setFrom(toDateInputValue(start));
    setTo(toDateInputValue(end));
  }

  return (
    <section className="space-y-4">
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
          Report Timetime
        </p>
        <h1 className="text-xl font-semibold text-slate-50">
          Durasi Respon & Perbaikan
        </h1>
        <p className="text-xs text-slate-400">
          Menghitung waktu berdasarkan timestamp: created → received → started → resolved
        </p>

        {/* RANGE DISPLAY */}
        {!loading && summary?.range && (
          <p className="mt-2 text-[11px] text-slate-500">
            Range: {formatDateShort(summary.range.from)} - {formatDateShort(summary.range.to)}
          </p>
        )}
      </header>

      {/* FILTER BAR */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/60 px-3 py-3 text-xs sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
          <label className="text-slate-300">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => {
              setPage(1);
              setFrom(e.target.value);
            }}
            className="
        w-full sm:w-auto
        rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-100 outline-none
        [color-scheme:light]
        [&::-webkit-calendar-picker-indicator]:invert
        [&::-webkit-calendar-picker-indicator]:opacity-90
      "
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
          <label className="text-slate-300">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => {
              setPage(1);
              setTo(e.target.value);
            }}
            className="
        w-full sm:w-auto
        rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-100 outline-none
        [color-scheme:light]
        [&::-webkit-calendar-picker-indicator]:invert
        [&::-webkit-calendar-picker-indicator]:opacity-90
      "
          />
        </div>

        <div className="flex flex-wrap gap-2 sm:ml-auto">
          <button
            onClick={() => setRange(7)}
            className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-800"
          >
            7 Hari
          </button>
          <button
            onClick={() => setRange(30)}
            className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-800"
          >
            30 Hari
          </button>
          <button
            onClick={setThisMonth}
            className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-800"
          >
            Bulan Ini
          </button>

          <button
            onClick={load}
            className="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <p className="rounded-xl border border-red-500/40 bg-red-950/40 px-3 py-2 text-xs text-red-200">
          {error}
        </p>
      )}

      {/* LOADING */}
      {loading && (
        <p className="text-xs text-slate-400">Memuat data...</p>
      )}

      {/* SUMMARY */}
      {!loading && summary && human && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">Total</p>
            <p className="mt-2 text-2xl font-bold text-slate-50">{summary.total}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">Selesai</p>
            <p className="mt-2 text-2xl font-bold text-emerald-300">{summary.finished}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">Ditolak</p>
            <p className="mt-2 text-2xl font-bold text-red-300">{summary.rejected}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">Avg Response</p>
            <p className="mt-2 text-2xl font-bold text-slate-50">{human.avgResponseMin}m</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">Avg Repair</p>
            <p className="mt-2 text-2xl font-bold text-slate-50">{human.avgWorkMin}m</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">Avg Total</p>
            <p className="mt-2 text-2xl font-bold text-slate-50">{human.avgTotalMin}m</p>
          </div>
        </div>
      )}

      {/* TABLE */}
      {!loading && (
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80 shadow-[0_24px_80px_rgba(15,23,42,0.9)]">
          <div className="w-full overflow-x-auto">
            <table className="w-full table-fixed text-left text-xs text-slate-200">
              <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-3 w-[45%]">Judul</th>
                  <th className="px-4 py-3 w-[15%] hidden sm:table-cell">Status</th>
                  <th className="px-4 py-3 w-[15%]">Response</th>
                  <th className="px-4 py-3 w-[15%] hidden md:table-cell">Repair</th>
                  <th className="px-4 py-3 w-[10%] hidden md:table-cell">Total</th>
                </tr>
              </thead>

              <tbody>
                {reports.map((r) => {
                  const response = diffMinutes(r.createdAt, r.receivedAt);
                  const repair = diffMinutes(r.startedAt, r.resolvedAt);
                  const total = diffMinutes(r.createdAt, r.resolvedAt);

                  return (
                    <tr key={r.id} className="border-t border-white/5 hover:bg-slate-900/60">
                      <td className="px-4 py-3 text-sm text-slate-100 truncate">
                        {r.judul}
                      </td>

                      <td className="px-4 py-3 text-xs text-slate-300 hidden sm:table-cell truncate">
                        {r.status}
                      </td>

                      <td className="px-4 py-3 text-xs text-emerald-200 truncate">
                        {response ?? '-'}m
                      </td>

                      <td className="px-4 py-3 text-xs text-emerald-200 hidden md:table-cell truncate">
                        {repair ?? '-'}m
                      </td>

                      <td className="px-4 py-3 text-xs text-emerald-200 hidden md:table-cell truncate">
                        {total ?? '-'}m
                      </td>
                    </tr>
                  );
                })}

                {reports.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                      Tidak ada data.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* pagination tetap */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex flex-col gap-2 border-t border-white/10 bg-slate-900/40 px-4 py-3 text-xs text-slate-200 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
              <p className="text-slate-300">
                Halaman {pagination.page} dari {pagination.totalPages} • Total {pagination.total}
              </p>

              <div className="flex gap-2">
                <button
                  disabled={!pagination.hasPrev}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-1.5 font-semibold hover:bg-slate-800 disabled:opacity-50"
                >
                  Prev
                </button>

                <button
                  disabled={!pagination.hasNext}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-1.5 font-semibold hover:bg-slate-800 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

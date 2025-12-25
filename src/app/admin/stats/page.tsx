'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

type Stats = {
  ok: boolean;
  mode: string;
  total: number;
  range?: { from: string; to: string };
  perStatus: Record<string, number>;
  perHari: { day: string; total: number }[];
};

function toDateInputValue(d: Date) {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDay(day: string) {
  return new Date(day).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
  });
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [mode, setMode] = useState<'weak' | 'strong'>('weak');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  // default range: 7 hari terakhir
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

  async function load(opts?: { silent?: boolean }) {
    const silent = opts?.silent ?? false;

    if (!silent) {
      setLoading(true);
      setError(null);
    }

    try {
      const qs = new URLSearchParams();
      qs.set('mode', mode);
      if (from) qs.set('from', from);
      if (to) qs.set('to', to);

      const res = await fetch(`/api/stats?${qs.toString()}`, {
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        if (!silent) {
          setError(data.error || 'Gagal memuat statistik.');
          setStats(null);
        }
        return;
      }

      setStats(data);
      setLastUpdatedAt(new Date());
    } catch (e) {
      console.error(e);
      if (!silent) {
        setError('Terjadi kesalahan jaringan.');
        setStats(null);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }

  // ✅ load saat mode/from/to berubah
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, from, to]);

  // ✅ polling silent refresh
  useEffect(() => {
    let timer: any = null;

    function start() {
      if (timer) return;
      timer = setInterval(() => {
        if (document.hidden) return;
        load({ silent: true });
      }, 10000); // 10 detik
    }

    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    start();

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, from, to]);

  // quick filters
  function setRange(days: number) {
    const now = new Date();
    const toD = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const fromD = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (days - 1)));
    setFrom(toDateInputValue(fromD));
    setTo(toDateInputValue(toD));
  }

  function setThisMonth() {
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
    setFrom(toDateInputValue(start));
    setTo(toDateInputValue(end));
  }

  // ✅ chart data
  const chartData = useMemo(() => {
    if (!stats?.perHari) return [];
    return stats.perHari.map((d) => ({
      name: formatDay(d.day),
      total: d.total,
    }));
  }, [stats]);

  return (
    <section className="space-y-6">
      {/* HEADER */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Statistik Laporan
          </p>
          <h1 className="text-xl font-semibold text-slate-50">Statistik Sistem</h1>
          <p className="text-xs text-slate-400">
            Mode konsistensi: {mode === 'weak' ? 'Weak (Replica)' : 'Strong (Primary)'}
          </p>

          {lastUpdatedAt && (
            <p className="mt-1 text-[10px] text-slate-500">
              Terakhir update:{' '}
              {lastUpdatedAt.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </p>
          )}
          {stats?.mode === 'weak' && (
            <p className="text-[11px] text-amber-300">
              ⚠ Weak (Replica) dapat tertinggal dari Primary. Data bisa tidak lengkap.
            </p>
          )}
        </div>

        {/* SWITCH MODE */}
        <div className="inline-flex rounded-full border border-white/10 bg-slate-900/70 p-1 text-xs text-slate-200">
          <button
            onClick={() => setMode('weak')}
            className={`px-3 py-1 rounded-full transition ${mode === 'weak'
                ? 'bg-emerald-500 text-slate-900'
                : 'hover:bg-slate-800/80'
              }`}
          >
            Weak (Replica)
          </button>
          <button
            onClick={() => setMode('strong')}
            className={`px-3 py-1 rounded-full transition ${mode === 'strong'
                ? 'bg-emerald-500 text-slate-900'
                : 'hover:bg-slate-800/80'
              }`}
          >
            Strong (Primary)
          </button>
        </div>
      </header>

      {/* FILTER BAR */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/60 px-3 py-3 text-xs">
        <div className="flex items-center gap-2">
          <label className="text-slate-300">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
            }}
            className="
              rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-100 outline-none
              [color-scheme:light]
              [&::-webkit-calendar-picker-indicator]:invert
              [&::-webkit-calendar-picker-indicator]:opacity-90
            "
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-slate-300">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
            }}
            className="
              rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-100 outline-none
              [color-scheme:light]
              [&::-webkit-calendar-picker-indicator]:invert
              [&::-webkit-calendar-picker-indicator]:opacity-90
            "
          />
        </div>

        <div className="ml-auto flex flex-wrap gap-2">
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
            onClick={() => load()}
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
        <p className="text-xs text-slate-400">Memuat statistik...</p>
      )}

      {!loading && stats && (
        <>
          {/* STATUS CARDS */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-lg shadow-black/30">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Total
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-50">
                {stats.total}
              </p>
            </div>

            {Object.entries(stats.perStatus).map(([status, total]) => (
              <div
                key={status}
                className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-lg shadow-black/30"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  {status}
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-50">
                  {total}
                </p>
              </div>
            ))}
          </div>

          {/* CHART */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-5 shadow-xl shadow-black/40">
            <h3 className="text-sm font-semibold text-slate-300">
              Grafik Laporan Harian
            </h3>

            {chartData.length === 0 ? (
              <p className="mt-2 text-xs text-slate-500">
                Belum ada laporan pada range ini.
              </p>
            ) : (
              <div className="mt-4 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="total" fill="#34d399" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

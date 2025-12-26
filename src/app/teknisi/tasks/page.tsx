// src/app/teknisi/tasks/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Task = {
  id: string;
  judul: string;
  lokasi: string;
  status: string;
  prioritas: string;
  kategori: string;
  createdAt: string;
};

export default function TeknisiTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'AKTIF' | 'SELESAI'>('AKTIF');

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/teknisi/tasks', { credentials: 'include' });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Gagal memuat tugas.');
        setTasks([]);
        return;
      }

      setTasks(data.tasks || []);
    } catch (e) {
      console.error(e);
      setError('Gagal memuat tugas.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = tasks.filter((t) => {
    if (tab === 'AKTIF') return t.status !== 'SELESAI';
    return t.status === 'SELESAI';
  });

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 px-4 py-6">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,#6366f1_0,#020617_55%,#000_100%)] opacity-70" />

      <div className="relative z-10 mx-auto max-w-6xl space-y-4">

        {/* HEADER */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300/80">
              Teknisi Panel
            </p>
            <h1 className="text-lg font-semibold">Daftar Tugas</h1>
            <p className="text-xs text-slate-300">
              Semua tugas aktif & selesai.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={load}
              className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-xs font-semibold hover:bg-slate-800"
            >
              Refresh
            </button>

            <Link
              href="/teknisi/dashboard"
              className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-xs font-semibold hover:bg-slate-800"
            >
              Kembali
            </Link>
          </div>
        </header>

        {/* TAB */}
        <div className="flex gap-2">
          <button
            onClick={() => setTab('AKTIF')}
            className={`rounded-xl px-4 py-2 text-xs font-semibold border ${
              tab === 'AKTIF'
                ? 'bg-emerald-500 text-white border-emerald-400'
                : 'bg-slate-900/70 border-white/10 text-slate-200'
            }`}
          >
            Aktif
          </button>

          <button
            onClick={() => setTab('SELESAI')}
            className={`rounded-xl px-4 py-2 text-xs font-semibold border ${
              tab === 'SELESAI'
                ? 'bg-indigo-500 text-white border-indigo-400'
                : 'bg-slate-900/70 border-white/10 text-slate-200'
            }`}
          >
            Selesai
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <p className="rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-2 text-xs text-red-200">
            {error}
          </p>
        )}

        {/* LIST */}
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 text-xs text-slate-300">
            Memuat tugas...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 text-center text-xs text-slate-300">
            Tidak ada tugas untuk tab ini.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((t) => (
              <div
                key={t.id}
                className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.8)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold">{t.judul}</h2>
                    <p className="mt-1 text-xs text-slate-300">
                      Lokasi: <span className="text-emerald-300">{t.lokasi}</span>
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Status: {t.status} • Prioritas: {t.prioritas} • {t.kategori}
                    </p>
                  </div>

                  <Link
                    href={`/reports/${t.id}`}
                    className="rounded-xl border border-white/10 bg-slate-900/70 px-3 py-1.5 text-[11px] font-semibold text-slate-100 hover:bg-slate-800"
                  >
                    Detail
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

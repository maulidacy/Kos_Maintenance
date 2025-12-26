// src/app/admin/reports/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type ReportRow = {
  id: string;
  judul: string;
  kategori: string;
  prioritas: string;
  status: string;
  lokasi: string;
  createdAt: string;
  assignedToId?: string | null;
};

type Technician = {
  id: string;
  namaLengkap: string;
  email: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export default function AdminReportsPage() {
  const router = useRouter();

  const [reports, setReports] = useState<ReportRow[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const [teknisi, setTeknisi] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  const [checkingRole, setCheckingRole] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const LIMIT = 10;

  useEffect(() => {
    async function checkRole() {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        const data = await res.json();

        if (!data.user) {
          router.push('/login');
          return;
        }

        if (data.user.role !== 'ADMIN') {
          router.push('/reports');
          return;
        }

        setIsAdmin(true);
      } catch (e) {
        console.error(e);
        router.push('/login');
      } finally {
        setCheckingRole(false);
      }
    }

    checkRole();
  }, [router]);

  async function load(opts?: { silent?: boolean }) {
    const silent = opts?.silent ?? false;

    if (!silent) {
      setLoading(true);
      setError(null);
    }

    try {
      const res = await fetch(
        `/api/reports?admin=1&mode=strong&page=${page}&limit=${LIMIT}`,
        { credentials: 'include' }
      );
      const data = await res.json();

      if (!res.ok) {
        if (!silent) {
          setError(data.error || 'Gagal memuat laporan.');
          setReports([]);
          setPagination(null);
        }
        return;
      }

      setReports(data.reports || []);
      setPagination(data.pagination || null);
      setLastUpdatedAt(new Date());

      // teknisi hanya perlu fetch sekali saat load normal
      if (!silent) {
        const resTek = await fetch('/api/admin/teknisi', {
          credentials: 'include',
        });
        const dataTek = await resTek.json();
        setTeknisi(dataTek.teknisi || []);
      }
    } catch (e) {
      console.error(e);
      if (!silent) {
        setError('Gagal memuat data laporan / teknisi.');
        setReports([]);
        setPagination(null);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }

  // load hanya kalau user admin
  useEffect(() => {
    if (!isAdmin) return;
    load();
  }, [isAdmin, page]);

  useEffect(() => {
    if (!isAdmin) return;

    let timer: ReturnType<typeof setInterval> | null = null;

    function start() {
      if (timer) return;
      timer = setInterval(() => {
        if (document.hidden) return;
        if (busyId) return;
        load({ silent: true });
      }, 8000);
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
  }, [isAdmin, busyId, page]);


  async function handleReceive(id: string) {
    setBusyId(id);
    setError(null);

    try {
      const res = await fetch(`/api/reports/${id}/receive`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Gagal menerima laporan.');
        return;
      }

      await load();
    } catch (e) {
      console.error(e);
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleAssign(reportId: string, teknisiId: string) {
    if (!teknisiId) return;

    setBusyId(reportId);
    setError(null);

    try {
      const res = await fetch(`/api/reports/${reportId}/assign`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teknisiId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Gagal assign teknisi.');
        return;
      }

      await load();
    } catch (e) {
      console.error(e);
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(id: string) {
    const reason = prompt('Alasan penolakan (opsional):') || '';

    setBusyId(id);
    setError(null);

    try {
      const res = await fetch(`/api/reports/${id}/reject`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: reason }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Gagal menolak laporan.');
        return;
      }

      await load();
    } catch (e) {
      console.error(e);
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setBusyId(null);
    }
  }

  if (checkingRole) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 px-3 py-6">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,#6366f1_0,#020617_55%,#000_100%)] opacity-70" />
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-4">
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-xs text-slate-300">
            Mengecek akses admin...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 px-3 py-6">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,#6366f1_0,#020617_55%,#000_100%)] opacity-70" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-4">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold">Semua Laporan</h1>
            <p className="text-xs text-slate-300">
              Admin bisa menerima laporan & assign teknisi.
            </p>
            {lastUpdatedAt && (
              <p className="mt-1 text-[10px] text-slate-500">
                Terakhir update: {lastUpdatedAt.toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </p>
            )}

          </div>

          <Link
            href="/admin/dashboard"
            className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs font-medium text-slate-100 hover:bg-slate-800"
          >
            Kembali
          </Link>
        </header>

        {error && (
          <p className="rounded-xl border border-red-500/40 bg-red-950/40 px-3 py-2 text-xs text-red-200">
            {error}
          </p>
        )}

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-xs text-slate-300">
            Memuat laporan...
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-slate-950/80 shadow-[0_24px_80px_rgba(15,23,42,0.9)]">
            <div className="overflow-hidden">
              <table className="w-full table-fixed text-left text-[11px] text-slate-200 sm:text-xs">
                <thead className="bg-slate-900/80 text-[10px] uppercase tracking-wide text-slate-400 sm:text-[11px]">
                  <tr>
                    {/* Judul wajib tampil */}
                    <th className="w-[40%] px-2 py-2 sm:px-4 sm:py-3">Judul</th>

                    {/* Kategori hide di mobile */}
                    <th className="hidden w-[14%] px-2 py-2 sm:table-cell sm:px-4 sm:py-3">
                      Kategori
                    </th>

                    {/* Status wajib tampil */}
                    <th className="w-[16%] px-2 py-2 sm:px-4 sm:py-3">Status</th>

                    {/* Prioritas hide di mobile */}
                    <th className="hidden w-[14%] px-2 py-2 sm:table-cell sm:px-4 sm:py-3">
                      Prioritas
                    </th>

                    {/* Lokasi hide di mobile (baru muncul md) */}
                    <th className="hidden w-[16%] px-2 py-2 md:table-cell sm:px-4 sm:py-3">
                      Lokasi
                    </th>

                    {/* Aksi wajib tampil */}
                    <th className="w-[28%] px-2 py-2 sm:px-4 sm:py-3">Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {reports.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                        Belum ada laporan.
                      </td>
                    </tr>
                  ) : (
                    reports.map((r) => (
                      <tr
                        key={r.id}
                        className="border-t border-white/5 hover:bg-slate-900/60"
                      >
                        {/* Judul */}
                        <td className="px-2 py-2 sm:px-4 sm:py-3 text-slate-100">
                          <Link
                            href={`/reports/${r.id}`}
                            className="block truncate hover:text-emerald-300 hover:underline underline-offset-2"
                            title={r.judul}
                          >
                            {r.judul}
                          </Link>
                        </td>

                        {/* Kategori */}
                        <td className="hidden px-2 py-2 sm:table-cell sm:px-4 sm:py-3 text-slate-300 truncate">
                          {r.kategori}
                        </td>

                        {/* Status */}
                        <td className="px-2 py-2 sm:px-4 sm:py-3 text-slate-300 truncate">
                          {r.status}
                        </td>

                        {/* Prioritas */}
                        <td className="hidden px-2 py-2 sm:table-cell sm:px-4 sm:py-3 text-slate-300 truncate">
                          {r.prioritas}
                        </td>

                        {/* Lokasi */}
                        <td className="hidden px-2 py-2 md:table-cell sm:px-4 sm:py-3 text-slate-300 truncate">
                          {r.lokasi}
                        </td>

                        {/* AKSI */}
                        <td className="px-2 py-2 sm:px-4 sm:py-3">
                          <div className="flex flex-wrap items-center gap-2">

                            {/* BARU: Receive + Reject */}
                            {r.status === 'BARU' && (
                              <>
                                <button
                                  onClick={() => handleReceive(r.id)}
                                  disabled={busyId === r.id}
                                  className="rounded-xl bg-emerald-500 px-3 py-1.5 text-[10px] sm:text-[11px] font-semibold text-white shadow hover:bg-emerald-600 disabled:opacity-60"
                                >
                                  {busyId === r.id ? '...' : 'Receive'}
                                </button>

                                <button
                                  onClick={() => handleReject(r.id)}
                                  disabled={busyId === r.id}
                                  className="rounded-xl bg-red-600 px-3 py-1.5 text-[10px] sm:text-[11px] font-semibold text-white shadow hover:bg-red-700 disabled:opacity-60"
                                >
                                  {busyId === r.id ? '...' : 'Reject'}
                                </button>
                              </>
                            )}

                            {/* DIPROSES: Assign teknisi (NO Reject) */}
                            {r.status === 'DIPROSES' && (
                              <select
                                disabled={busyId === r.id}
                                className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-[10px] sm:text-[11px] text-slate-200 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30"
                                value={r.assignedToId ?? ''}
                                onChange={(e) => {
                                  const teknisiId = e.target.value;
                                  if (!teknisiId) return;
                                  handleAssign(r.id, teknisiId);
                                }}
                              >
                                <option value="">Assign teknisi...</option>
                                {teknisi.map((t) => (
                                  <option key={t.id} value={t.id}>
                                    {t.namaLengkap}
                                  </option>
                                ))}
                              </select>
                            )}

                            {/* Status lainnya tidak ada aksi */}
                            {r.status !== 'BARU' && r.status !== 'DIPROSES' && (
                              <span className="text-[10px] sm:text-[11px] text-slate-500">
                                Tidak ada aksi
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between gap-2 border-t border-white/10 bg-slate-900/40 px-4 py-3 text-xs text-slate-200">
                <p className="text-slate-300">
                  Halaman {pagination.page} dari {pagination.totalPages} • Total {pagination.total}
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
          </div>
        )}
      </div>
    </main>
  );
}

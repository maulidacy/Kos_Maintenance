// src/app/reports/[id]/page.tsx
'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

type ReportDetail = {
  id: string;
  judul: string;
  kategori: string;
  prioritas: 'RENDAH' | 'SEDANG' | 'TINGGI';
  status: 'BARU' | 'DIPROSES' | 'DIKERJAKAN' | 'SELESAI' | 'DITOLAK';
  lokasi: string;
  deskripsi: string;
  fotoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  receivedAt?: string | null;
  startedAt?: string | null;
  resolvedAt?: string | null;
  user?: {
    namaLengkap: string;
    nomorKamar: string | null;
    email: string;
  };
};

type ApiError = {
  error?: string;
  details?: unknown;
};

type MeUser = {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'TEKNISI';
  namaLengkap: string;
};

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [events, setEvents] = useState<any[]>([]);
  const [me, setMe] = useState<MeUser | null>(null);
  const [meLoading, setMeLoading] = useState(true);

  const [report, setReport] = useState<ReportDetail | null>(null);

  const [judul, setJudul] = useState('');
  const [kategori, setKategori] = useState('AIR');
  const [prioritas, setPrioritas] = useState<'RENDAH' | 'SEDANG' | 'TINGGI'>(
    'SEDANG'
  );
  const [lokasi, setLokasi] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');

  const role = me?.role || null;

  const isUser = !meLoading && role === 'USER';
  const isTeknisi = !meLoading && role === 'TEKNISI';
  const isAdmin = !meLoading && role === 'ADMIN';

  const canEdit = isUser && report?.status === 'BARU';
  const canDelete = isUser && report?.status === 'BARU';

  // load user login
  useEffect(() => {
    async function loadMe() {
      setMeLoading(true);
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        const data = await res.json().catch(() => ({}));
        setMe(data.user || null);
      } catch (e) {
        console.error(e);
        setMe(null);
      } finally {
        setMeLoading(false);
      }
    }
    loadMe();
  }, []);

  // load report detail
  useEffect(() => {
    if (!reportId) return;

    async function loadDetail() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/reports/${reportId}`, {
          credentials: 'include',
        });

        const data: { report?: ReportDetail } & ApiError = await res.json();

        if (!res.ok || !data.report) {
          setError(data.error || 'Gagal memuat detail laporan.');
          return;
        }

        setReport(data.report);
        setJudul(data.report.judul);
        setKategori(data.report.kategori);
        setPrioritas(data.report.prioritas);
        setLokasi(data.report.lokasi);
        setDeskripsi(data.report.deskripsi);
        setFotoUrl(data.report.fotoUrl || '');
      } catch (err) {
        console.error(err);
        setError('Terjadi kesalahan. Coba lagi nanti.');
      } finally {
        setLoading(false);
      }
    }

    loadDetail();
  }, [reportId]);

  // load events
  useEffect(() => {
    if (!reportId) return;

    async function loadEvents() {
      try {
        const res = await fetch(`/api/reports/${reportId}/events`, {
          credentials: 'include',
        });
        const data = await res.json();
        setEvents(data.events || []);
      } catch (e) {
        console.error(e);
      }
    }

    loadEvents();
  }, [reportId]);

  // USER save report (only status BARU)
  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!report) return;

    if (!canEdit) {
      setError('Laporan sudah diproses, tidak bisa diedit.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/reports/${report.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          judul,
          kategori,
          prioritas,
          lokasi,
          deskripsi,
          fotoUrl: fotoUrl || undefined,
        }),
      });

      const data: { report?: ReportDetail } & ApiError = await res.json();

      if (!res.ok || !data.report) {
        setError(data.error || 'Gagal menyimpan perubahan.');
        return;
      }

      setReport(data.report);
      setSuccess('Perubahan berhasil disimpan.');
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan saat menyimpan.');
    } finally {
      setSaving(false);
    }
  }

  // USER delete report (only status BARU)
  async function handleDelete() {
    if (!confirm('Yakin ingin menghapus laporan ini?')) return;

    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || 'Gagal menghapus laporan.');
        return;
      }

      router.push('/reports');
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setDeleting(false);
    }
  }

  // TEKNISI start
  async function handleStart() {
    if (!report) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/reports/${report.id}/start`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Gagal memulai laporan.');
        return;
      }

      setSuccess('Laporan berhasil dimulai.');
      window.location.reload();
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan saat start.');
    } finally {
      setSaving(false);
    }
  }

  // TEKNISI resolve
  async function handleResolve() {
    if (!report) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/reports/${report.id}/resolve`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Gagal menyelesaikan laporan.');
        return;
      }

      setSuccess('Laporan berhasil diselesaikan.');
      window.location.reload();
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan saat resolve.');
    } finally {
      setSaving(false);
    }
  }

  const disableFields = meLoading || !canEdit;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 px-3 py-6">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,#6366f1_0,#020617_55%,#000_100%)] opacity-70" />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col gap-5">
        <header className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300/80">
              Detail Laporan
            </p>
            <h1 className="mt-1 text-lg font-semibold">
              {report ? report.judul : 'Memuat...'}
            </h1>
          </div>

          <Link
            href="/reports"
            className="inline-flex items-center rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-800"
          >
            Kembali
          </Link>
        </header>

        <section className="grid gap-4 rounded-3xl border border-white/10 bg-slate-950/80 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.9)] backdrop-blur md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          {/* FORM */}
          <form
            onSubmit={handleSave}
            className="space-y-4 border-b border-slate-800 pb-4 md:border-b-0 md:border-r md:pb-0 md:pr-4"
          >
            {loading ? (
              <p className="text-xs text-slate-300">Memuat detail laporan...</p>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-200">
                    Judul laporan
                  </label>
                  <input
                    type="text"
                    value={judul}
                    onChange={(e) => setJudul(e.target.value)}
                    disabled={disableFields}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 disabled:bg-slate-900/40"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-200">
                      Kategori
                    </label>
                    <select
                      value={kategori}
                      onChange={(e) => setKategori(e.target.value)}
                      disabled={disableFields}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 disabled:bg-slate-900/40"
                    >
                      <option value="AIR">Air</option>
                      <option value="LISTRIK">Listrik</option>
                      <option value="WIFI">WiFi</option>
                      <option value="KEBERSIHAN">Kebersihan</option>
                      <option value="FASILITAS_UMUM">Fasilitas Umum</option>
                      <option value="LAINNYA">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-200">
                      Prioritas
                    </label>
                    <select
                      value={prioritas}
                      onChange={(e) =>
                        setPrioritas(e.target.value as 'RENDAH' | 'SEDANG' | 'TINGGI')
                      }
                      disabled={disableFields}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 disabled:bg-slate-900/40"
                    >
                      <option value="RENDAH">Rendah</option>
                      <option value="SEDANG">Sedang</option>
                      <option value="TINGGI">Tinggi</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-200">
                    Lokasi/Nomor Kamar
                  </label>
                  <input
                    type="text"
                    value={lokasi}
                    onChange={(e) => setLokasi(e.target.value)}
                    disabled={disableFields}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 disabled:bg-slate-900/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-200">
                    Deskripsi
                  </label>
                  <textarea
                    rows={4}
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    disabled={disableFields}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 disabled:bg-slate-900/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-200">
                    URL Foto (opsional)
                  </label>
                  <input
                    type="url"
                    value={fotoUrl}
                    onChange={(e) => setFotoUrl(e.target.value)}
                    disabled={disableFields}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 disabled:bg-slate-900/40"
                  />
                </div>

                {error && (
                  <p className="rounded-xl border border-red-500/50 bg-red-950/40 px-3 py-2 text-xs text-red-200">
                    {error}
                  </p>
                )}
                {success && (
                  <p className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 px-3 py-2 text-xs text-emerald-200">
                    {success}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  {!meLoading && isUser && (
                    <>
                      <button
                        type="submit"
                        disabled={saving || !canEdit}
                        className="inline-flex items-center rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 disabled:bg-emerald-500/50"
                      >
                        {saving ? 'Menyimpan...' : 'Simpan perubahan'}
                      </button>

                      {canDelete && (
                        <button
                          type="button"
                          onClick={handleDelete}
                          disabled={deleting}
                          className="inline-flex items-center rounded-xl border border-red-500/60 bg-red-950/50 px-3 py-2 text-xs font-semibold text-red-100 hover:bg-red-900/70 disabled:opacity-60"
                        >
                          {deleting ? 'Menghapus...' : 'Hapus laporan'}
                        </button>
                      )}
                    </>
                  )}

                  {!meLoading && isTeknisi && report?.status === 'DIPROSES' && (
                    <button
                      type="button"
                      onClick={handleStart}
                      disabled={saving}
                      className="inline-flex items-center rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 disabled:bg-emerald-500/50"
                    >
                      {saving ? '...' : 'Start'}
                    </button>
                  )}

                  {!meLoading && isTeknisi && report?.status === 'DIKERJAKAN' && (
                    <button
                      type="button"
                      onClick={handleResolve}
                      disabled={saving}
                      className="inline-flex items-center rounded-xl bg-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-600 disabled:bg-indigo-500/50"
                    >
                      {saving ? '...' : 'Resolve'}
                    </button>
                  )}

                  {!meLoading && isAdmin && (
                    <p className="text-xs text-slate-400">
                      Admin hanya dapat melihat detail laporan.
                    </p>
                  )}
                </div>
              </>
            )}
          </form>

          {/* SIDE PANEL */}
          <div className="space-y-3">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-xs">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Timeline
              </p>

              {events.length === 0 ? (
                <p className="mt-2 text-slate-400">Belum ada event.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {events.map((ev) => (
                    <div
                      key={ev.id}
                      className="rounded-xl border border-white/5 bg-slate-950/40 px-3 py-2"
                    >
                      <p className="text-[11px] font-semibold text-emerald-300">
                        {ev.type}
                      </p>
                      <p className="text-[11px] text-slate-200">
                        {ev.note || '-'}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {new Date(ev.at).toLocaleString('id-ID')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

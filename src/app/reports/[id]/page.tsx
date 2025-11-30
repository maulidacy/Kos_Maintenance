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

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [report, setReport] = useState<ReportDetail | null>(null);

  // form state
  const [judul, setJudul] = useState('');
  const [kategori, setKategori] = useState('AIR');
  const [prioritas, setPrioritas] = useState<'RENDAH' | 'SEDANG' | 'TINGGI'>(
    'SEDANG',
  );
  const [lokasi, setLokasi] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');

  // apakah boleh edit/hapus?
  const canEdit = report?.status === 'BARU';

  useEffect(() => {
    if (!reportId) return;

    async function loadDetail() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/reports/${reportId}`);
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
        console.error('Fetch detail error:', err);
        setError('Terjadi kesalahan. Coba lagi nanti.');
      } finally {
        setLoading(false);
      }
    }

    loadDetail();
  }, [reportId]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!report) return;
    if (!canEdit) {
      setError(
        'Laporan yang sudah diproses tidak bisa diedit. Hubungi admin jika ada koreksi.',
      );
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/reports/${report.id}`, {
        method: 'PATCH',
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
        console.error('Update report detail:', data.details);
        setError(data.error || 'Gagal menyimpan perubahan.');
        return;
      }

      setReport(data.report);
      setSuccess('Perubahan berhasil disimpan.');
    } catch (err) {
      console.error('PATCH error:', err);
      setError('Terjadi kesalahan saat menyimpan.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Yakin ingin menghapus laporan ini?')) return;

    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
      });

      let data: { ok?: boolean; message?: string; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        // jika berhasil tapi body kosong
      }

      if (!res.ok || data.error) {
        setError(
          data.error ||
          'Gagal menghapus laporan. Pastikan status masih BARU atau Anda admin.',
        );
        return;
      }

      router.push('/reports'); // redirect ke halaman daftar report
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan jaringan saat menghapus laporan.');
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 px-3 py-6">
      {/* Background radial gradient konsisten */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,#6366f1_0,#020617_55%,#000_100%)] opacity-70" />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col gap-5">
        {/* Header + back link */}
        <header className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300/80">
              Detail Laporan
            </p>
            <h1 className="mt-1 text-lg font-semibold">
              {report ? report.judul : 'Memuat...'}
            </h1>
            {report && (
              <p className="text-xs text-slate-300">
                Status:{' '}
                <span className="font-semibold text-emerald-300">
                  {report.status}
                </span>{' '}
                • Dibuat:{' '}
                {new Date(report.createdAt).toLocaleString('id-ID')}
              </p>
            )}
          </div>

          <Link
            href="/reports"
            className="inline-flex items-center rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-800"
          >
            Kembali ke daftar
          </Link>
        </header>

        {/* Kartu utama */}
        <section className="grid gap-4 rounded-3xl border border-white/10 bg-slate-950/80 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.9)] backdrop-blur md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          {/* Form edit */}
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
                    disabled={!canEdit}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 disabled:cursor-not-allowed disabled:bg-slate-900/40"
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
                      disabled={!canEdit}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 disabled:cursor-not-allowed disabled:bg-slate-900/40"
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
                        setPrioritas(
                          e.target.value as 'RENDAH' | 'SEDANG' | 'TINGGI',
                        )
                      }
                      disabled={!canEdit}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 disabled:cursor-not-allowed disabled:bg-slate-900/40"
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
                    disabled={!canEdit}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 disabled:cursor-not-allowed disabled:bg-slate-900/40"
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
                    disabled={!canEdit}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 disabled:cursor-not-allowed disabled:bg-slate-900/40"
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
                    disabled={!canEdit}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 disabled:cursor-not-allowed disabled:bg-slate-900/40"
                    placeholder="https://..."
                  />
                  <p className="mt-1 text-[10px] text-slate-400">
                    Kosongkan jika tidak ada foto.
                  </p>
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

                {!canEdit && (
                  <p className="text-[11px] text-amber-300/90">
                    Laporan sudah diproses, sehingga tidak bisa diedit dari
                    sisi penghuni. Hubungi admin jika ada koreksi.
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving || !canEdit}
                    className="inline-flex items-center rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-500/50"
                  >
                    {saving ? 'Menyimpan...' : 'Simpan perubahan'}
                  </button>

                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="inline-flex items-center rounded-xl border border-red-500/60 bg-red-950/50 px-3 py-2 text-xs font-semibold text-red-100 hover:bg-red-900/70 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deleting ? 'Menghapus...' : 'Hapus laporan'}
                  </button>
                </div>
              </>
            )}
          </form>

          {/* Panel info pelapor & status */}
          <div className="space-y-3">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-xs">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Info Status
              </p>
              {report ? (
                <ul className="mt-2 space-y-1 text-slate-200">
                  <li>
                    <span className="text-slate-400">Status:</span>{' '}
                    <span className="font-semibold text-emerald-300">
                      {report.status}
                    </span>
                  </li>
                  <li>
                    <span className="text-slate-400">Dibuat:</span>{' '}
                    {new Date(report.createdAt).toLocaleString('id-ID')}
                  </li>
                  <li>
                    <span className="text-slate-400">Diupdate:</span>{' '}
                    {new Date(report.updatedAt).toLocaleString('id-ID')}
                  </li>
                </ul>
              ) : (
                <p className="mt-2 text-slate-300">
                  Memuat informasi status...
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-xs">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Info Pelapor
              </p>
              {report ? (
                <ul className="mt-2 space-y-1 text-slate-200">
                  {/* Nama pelapor (kalau ada) */}
                  {report.user?.namaLengkap && <li>{report.user.namaLengkap}</li>}

                  {/* LOKASI LAPORAN → ini yang harus SELALAS dengan form */}
                  {report.lokasi && (
                    <li className="text-slate-300">Lokasi: {report.lokasi}</li>
                  )}

                  {/* Opsional: kamar terdaftar di profil, kalau berbeda dari lokasi laporan */}
                  {report.user?.nomorKamar &&
                    report.user.nomorKamar !== report.lokasi && (
                      <li className="text-slate-400 text-[11px]">
                        Kamar terdaftar: {report.user.nomorKamar}
                      </li>
                    )}

                  {/* Email pelapor */}
                  {report.user?.email && (
                    <li className="text-slate-400 text-[11px]">
                      {report.user.email}
                    </li>
                  )}
                </ul>
              ) : (
                <p className="mt-2 text-slate-300">
                  Informasi pelapor tidak tersedia.
                </p>
              )}
            </div>
            {report?.fotoUrl && (
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-xs">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Foto Laporan
                </p>
                <a
                  href={report.fotoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex text-[11px] text-emerald-300 underline hover:text-emerald-200"
                >
                  Buka foto di tab baru
                </a>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

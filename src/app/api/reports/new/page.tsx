'use client';

import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import Link from 'next/link';

type CreateReportResponse = {
  report?: any;
  error?: string;
  details?: any;
};

export default function NewReportPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    kategori: 'AIR',
    judul: '',
    deskripsi: '',
    fotoUrl: '',
    prioritas: 'SEDANG',
    lokasi: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kategori: form.kategori,
          judul: form.judul,
          deskripsi: form.deskripsi,
          fotoUrl: form.fotoUrl || undefined,
          prioritas: form.prioritas,
          lokasi: form.lokasi,
        }),
      });

      let data: CreateReportResponse | null = null;
      try {
        data = await res.json();
      } catch {
        console.error('Create report: response bukan JSON, status:', res.status);
        setError('Terjadi kesalahan server. (Respon bukan JSON)');
        return;
      }

      if (!res.ok) {
        console.error('Create report error data:', data);
        setError(data?.error || 'Input tidak valid, periksa kembali form.');
        return;
      }

      // sukses → balik ke list laporan
      router.push('/reports');
    } catch (err) {
      console.error('Create report error:', err);
      setError('Terjadi kesalahan jaringan. Coba lagi nanti.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      {/* background konsisten */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,#6366f1_0,#020617_55%,#000_100%)] opacity-70" />

      <div className="relative z-10 flex w-full max-w-4xl flex-col gap-6">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg md:text-xl font-semibold">
              Buat Laporan Fasilitas
            </h1>
            <p className="text-xs text-slate-300">
              Laporkan masalah air, listrik, WiFi, kebersihan, atau fasilitas lain.
            </p>
          </div>
          <Link
            href="/reports"
            className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs font-medium text-slate-100 hover:bg-slate-800"
          >
            Kembali ke daftar
          </Link>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-xl shadow-emerald-500/10 backdrop-blur"
        >
          <div>
            <label className="block text-xs font-medium text-slate-200">
              Judul laporan
            </label>
            <input
              name="judul"
              type="text"
              required
              value={form.judul}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50"
              placeholder="Contoh: Air kamar mandi tidak mengalir"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-200">
                Kategori
              </label>
              <select
                name="kategori"
                value={form.kategori}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50"
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
                name="prioritas"
                value={form.prioritas}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50"
              >
                <option value="RENDAH">Rendah</option>
                <option value="SEDANG">Sedang</option>
                <option value="TINGGI">Tinggi</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-200">
              Lokasi / Nomor kamar
            </label>
            <input
              name="lokasi"
              type="text"
              required
              value={form.lokasi}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50"
              placeholder="A-01 / Lantai 2"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-200">
              Deskripsi
            </label>
            <textarea
              name="deskripsi"
              required
              rows={4}
              value={form.deskripsi}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50"
              placeholder="Jelaskan masalahnya sedetail mungkin..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-200">
              URL Foto (opsional)
            </label>
            <input
              name="fotoUrl"
              type="url"
              value={form.fotoUrl}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50"
              placeholder="https://contoh.com/foto-masalah.jpg"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-950/40 border border-red-500/40 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 disabled:bg-emerald-500/60"
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

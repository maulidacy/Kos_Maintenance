'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type RegisterResponse = {
  message?: string;
  error?: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [namaLengkap, setNamaLengkap] = useState('');
  const [email, setEmail] = useState('');
  const [nomorKamar, setNomorKamar] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          namaLengkap,
          email,
          password,
          nomorKamar,
        }),
      });

      // ⛔ Prevent "Unexpected token <" error
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await res.text();
        console.error('⚠ Server returned NON-JSON:', text);
        setError('Terjadi kesalahan server. (Respon bukan JSON)');
        return;
      }

      const data: RegisterResponse = await res.json();

      if (!res.ok) {
        setError(data.error || 'Gagal mendaftar, coba lagi.');
        return;
      }

      // Sukses → masuk ke login
      router.push('/login');
    } catch (err) {
      console.error('Register error:', err);
      setError('Terjadi kesalahan jaringan. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,#6366f1_0,#020617_55%,#000_100%)] opacity-70" />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-10 lg:flex-row lg:items-center">

        {/* Left intro */}
        <section className="flex-1 space-y-5">
          <div className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-100">
            DAFTAR PENGHUNI KOS
          </div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Buat akun{' '}
            <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
              Kos Maintenance
            </span>
          </h1>

          <p className="max-w-md text-sm md:text-base text-slate-300">
            Dengan akun ini, kamu dapat melaporkan masalah fasilitas, memantau
            progres perbaikan, dan berkomunikasi dengan admin kos.
          </p>

          <div className="mt-4 grid gap-3 text-xs md:text-sm text-slate-300 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-3">
              <p className="font-semibold text-slate-100">Transparan</p>
              <p className="mt-1">Setiap laporan memiliki status jelas.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-3">
              <p className="font-semibold text-slate-100">Cepat</p>
              <p className="mt-1">Lapor kapan saja tanpa harus chat admin.</p>
            </div>
          </div>
        </section>

        {/* Right card */}
        <section className="flex-1">
          <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-emerald-500/20 backdrop-blur">

            <header className="mb-6 space-y-2 text-center">
              <h2 className="text-lg font-semibold">Daftar Penghuni Baru</h2>
              <p className="text-xs text-slate-400">
                Admin bisa mengubah role kamu menjadi ADMIN jika diperlukan.
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nama */}
              <div>
                <label className="block text-xs font-medium text-slate-200">
                  Nama lengkap
                </label>
                <input
                  type="text"
                  required
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50"
                  placeholder="Contoh: Budi Santoso"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-slate-200">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50"
                  placeholder="nama@contoh.com"
                />
              </div>

              {/* Nomor kamar */}
              <div>
                <label className="block text-xs font-medium text-slate-200">
                  Nomor kamar (opsional)
                </label>
                <input
                  type="text"
                  value={nomorKamar}
                  onChange={(e) => setNomorKamar(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50"
                  placeholder="A-01 / Lantai 2"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-slate-200">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50"
                  placeholder="Minimal 8 karakter"
                />
              </div>

              {/* Error box */}
              {error && (
                <p className="text-xs text-red-400 bg-red-950/40 border border-red-500/40 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600 disabled:bg-emerald-500/60"
              >
                {isSubmitting ? 'Mendaftar...' : 'Daftar'}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-slate-400">
              Sudah punya akun?{' '}
              <Link href="/login" className="font-semibold text-emerald-300 hover:text-emerald-200">
                Masuk sekarang
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

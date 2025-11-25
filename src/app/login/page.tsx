'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type LoginResponse = {
  user?: {
    id: string;
    namaLengkap: string;
    email: string;
    role: 'USER' | 'ADMIN';
  };
  error?: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await res.json();

      if (!res.ok) {
        setError(data.error || 'Gagal login, coba lagi.');
        return;
      }

      if (data.user?.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/reports');
      }
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan. Coba lagi nanti.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      {/* Background gradient */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,#4f46e5_0,#020617_50%,#000_100%)] opacity-70" />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-10 lg:flex-row lg:items-center">
        {/* Left intro */}
        <section className="flex-1 space-y-5">
          <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-100">
            SISTEM PELAPORAN FASILITAS KOS
          </div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Selamat datang kembali di{' '}
            <span className="bg-gradient-to-r from-indigo-300 to-sky-300 bg-clip-text text-transparent">
              Kos Maintenance
            </span>
          </h1>

          <p className="max-w-md text-sm md:text-base text-slate-300">
            Masuk sebagai penghuni atau admin untuk mengelola laporan fasilitas
            kos: air, listrik, WiFi, kebersihan, dan lainnya.
          </p>

          <ul className="mt-4 space-y-2 text-xs md:text-sm text-slate-300">
            <li>• Pantau status laporan secara realtime.</li>
            <li>• Prioritas laporan yang jelas: rendah, sedang, tinggi.</li>
            <li>• Mode strong, eventual, dan weak consistency di backend.</li>
          </ul>
        </section>

        {/* Right card */}
        <section className="flex-1">
          <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-indigo-500/20 backdrop-blur">
            <header className="mb-6 space-y-2 text-center">
              <h2 className="text-lg font-semibold">Masuk Penghuni / Admin</h2>
              <p className="text-xs text-slate-400">
                Gunakan email dan password yang sudah terdaftar.
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-slate-200"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  placeholder="nama@contoh.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-slate-200"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-950/40 border border-red-500/40 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-500/60"
              >
                {isSubmitting ? 'Memproses...' : 'Masuk'}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-slate-400">
              Belum punya akun?{' '}
              <Link
                href="/register"
                className="font-semibold text-indigo-300 hover:text-indigo-200"
              >
                Daftar penghuni baru
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

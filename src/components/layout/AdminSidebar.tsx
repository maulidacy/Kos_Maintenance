'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Clock3,
  LogOut,
  Mail,
  ShieldCheck,
} from 'lucide-react';

const links = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/reports', label: 'Laporan', icon: FileText },
  { href: '/admin/stats', label: 'Statistik', icon: BarChart3 },
  { href: '/admin/timetime', label: 'Timetime', icon: Clock3 },
];

type AdminSidebarProps = {
  className?: string;
  onNavigate?: () => void;
};

type MeUser = {
  id: string;
  namaLengkap: string;
  email: string;
  role: string;
};

function getInitial(name?: string) {
  if (!name) return 'A';
  return name.trim()[0]?.toUpperCase() ?? 'A';
}

export function AdminSidebar({ className = '', onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<MeUser | null>(null);

  async function loadUser() {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      const data = await res.json();
      setUser(data.user || null);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      console.error(e);
    } finally {
      router.push('/login');
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <aside
      className={`shrink-0 px-3 py-5 text-sm text-slate-100 ${className}`}
    >
      {/* PROFILE (compact & safe width) */}
      <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 shadow-sm shadow-black/30">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-sm font-bold text-emerald-200">
            {getInitial(user?.namaLengkap)}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-50">
              {user?.namaLengkap || 'Admin'}
            </p>

            <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
              <Mail className="h-3.5 w-3.5 shrink-0 opacity-80" />
              <span className="truncate">{user?.email || '-'}</span>
            </div>
          </div>
        </div>

        <div className="mt-3 inline-flex w-fit items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
          <ShieldCheck className="h-4 w-4 shrink-0 opacity-90" />
          {user?.role || 'ADMIN'}
        </div>
      </div>

      {/* NAV MENU */}
      <nav className="mt-6 space-y-1.5">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          const Icon = link.icon;

          const base =
            'flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition';
          const activeClass =
            'bg-emerald-500/15 text-emerald-100 border border-emerald-500/50 shadow-sm shadow-emerald-500/25';
          const inactiveClass =
            'text-slate-300 hover:bg-slate-800/80 hover:text-slate-50';

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={`${base} ${active ? activeClass : inactiveClass}`}
            >
              <span className="flex items-center gap-2">
                <Icon className="h-[18px] w-[18px] shrink-0 opacity-90" />
                {link.label}
              </span>

              {active && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* LOGOUT BUTTON */}
      <div className="mt-auto pt-6">
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-slate-800 transition"
        >
          <LogOut className="h-4 w-4 shrink-0 opacity-90" />
          Logout
        </button>
      </div>
    </aside>
  );
}

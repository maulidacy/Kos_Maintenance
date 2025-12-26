// src/components/layout/Navbar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavbarProps = {
  appName?: string;
  role?: 'USER' | 'ADMIN' | 'TEKNISI' | null;
  showSidebarToggle?: boolean;
  onToggleSidebar?: () => void;
};

export function Navbar({
  appName = 'Kos Maintenance',
  role,
  showSidebarToggle,
  onToggleSidebar,
}: NavbarProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur">
      <div className="flex w-full items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          {/* Tombol sidebar untuk mobile */}
          {showSidebarToggle && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-slate-900/80 text-slate-200 shadow hover:bg-slate-800 md:hidden"
              aria-label="Toggle sidebar"
            >
              <span className="flex flex-col gap-0.5">
                <span className="h-[2px] w-4 rounded bg-slate-200" />
                <span className="h-[2px] w-4 rounded bg-slate-200" />
                <span className="h-[2px] w-4 rounded bg-slate-200" />
              </span>
            </button>
          )}

          {/* Logo + brand */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/40">
              KM
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-slate-50">
                {appName}
              </span>
              <span className="text-[10px] uppercase tracking-[0.15em] text-emerald-300/80">
                Maintenance & Complaint
              </span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}

// src/app/(user)/layout.tsx
import type { ReactNode } from 'react';
import UserShell from './UserShell';

export const metadata = {
  title: 'Kos Maintenance',
};

export default function UserLayout({ children }: { children: ReactNode }) {
  return <UserShell>{children}</UserShell>;
}

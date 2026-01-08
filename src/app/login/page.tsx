// src/app/login/page.tsx
'use client';

import { Suspense } from 'react';
import LoginContent from './LoginContent';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-white p-10">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

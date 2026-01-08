'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginUserRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login?role=USER');
  }, [router]);

  return null;
}

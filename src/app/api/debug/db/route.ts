// src/app/api/debug/db/route.ts
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const result = await pool.query('SELECT NOW() AS now');
    return NextResponse.json(
      {
        ok: true,
        now: result.rows[0].now,
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    console.error('DB debug error:', err);

    const message = err instanceof Error ? err.message : 'unknown';
    const code =
      typeof err === 'object' && err !== null && 'code' in err
        ? (err as { code?: unknown }).code
        : null;

    return NextResponse.json(
      {
        ok: false,
        error: message,
        code,
      },
      { status: 500 },
    );
  }
}

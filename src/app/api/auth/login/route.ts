// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validation';
import { prisma } from '@/lib/prisma';
import { signJwt, verifyPassword } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: 'Body tidak valid' },
        { status: 400 },
      );
    }

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Input tidak valid', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 },
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 },
      );
    }

    const token = signJwt({
      userId: user.id,
      role: user.role,
      email: user.email,
    });

    const res = NextResponse.json(
      {
        message: 'Login berhasil',
        user: {
          id: user.id,
          namaLengkap: user.namaLengkap,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 },
    );

    res.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err: unknown) {
    console.error('Login API error (prisma):', err);

    const message = err instanceof Error ? err.message : 'unknown';

    return NextResponse.json(
      {
        error: 'Internal server error',
        detail: message,
      },
      { status: 500 },
    );
  }
}

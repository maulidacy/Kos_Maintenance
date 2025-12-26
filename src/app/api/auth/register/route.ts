// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/lib/validation';
import { hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Input tidak valid', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { namaLengkap, email, password, nomorKamar } = parsed.data;

    // cek email
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        namaLengkap,
        email,
        passwordHash,
        nomorKamar: nomorKamar ?? null,
        role: 'USER',
      },
      select: {
        id: true,
        namaLengkap: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Registrasi berhasil',
        user,
      },
      { status: 201 },
    );
  } catch (err: unknown) {
    console.error('Register API error (prisma):', err);

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

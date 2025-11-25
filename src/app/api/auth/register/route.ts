export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/validation';
import { hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Input tidak valid', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { namaLengkap, email, password, nomorKamar } = parsed.data;

    // cek apakah email sudah dipakai
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'Email sudah digunakan' },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);

    await prisma.user.create({
      data: {
        namaLengkap,
        email,
        passwordHash,
        nomorKamar: nomorKamar || null,
        role: 'USER',
      },
    });

    return NextResponse.json(
      { message: 'Registrasi berhasil' },
      { status: 201 },
    );
  } catch (error) {
    console.error('Register API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

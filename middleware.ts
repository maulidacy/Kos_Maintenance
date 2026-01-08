// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

type JwtPayload = {
  userId: string;
  role: "USER" | "ADMIN" | "TEKNISI";
  email: string;
};

async function verifyJwtEdge(token: string): Promise<JwtPayload | null> {
  try {
    const secretValue = process.env.JWT_SECRET;

    // kalau secret kosong → jangan crash, anggap token invalid
    if (!secretValue || secretValue.trim() === "") {
      return null;
    }

    const secret = new TextEncoder().encode(secretValue);
    const { payload } = await jwtVerify(token, secret);

    // validasi payload minimal
    if (!payload || typeof payload.role !== "string") return null;

    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    const payload = token ? await verifyJwtEdge(token) : null;

    // login pages
    if (req.nextUrl.pathname.startsWith('/login')) {
      if (payload) {
        // redirect logged-in users to their dashboard
        if (payload.role === 'ADMIN') {
          return NextResponse.redirect(new URL('/admin/dashboard', req.url));
        }
        if (payload.role === 'TEKNISI') {
          return NextResponse.redirect(new URL('/teknisi/dashboard', req.url));
        }
        return NextResponse.redirect(new URL('/reports', req.url));
      }
      // allow access to login pages if not logged in
      return NextResponse.next();
    }

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (!payload) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // admin routes
    if (req.nextUrl.pathname.startsWith("/admin")) {
      if (payload.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/reports", req.url));
      }
    }

    // teknisi routes
    if (req.nextUrl.pathname.startsWith("/teknisi")) {
      if (payload.role !== "TEKNISI") {
        return NextResponse.redirect(new URL("/reports", req.url));
      }
    }

    return NextResponse.next();
  } catch (err) {
    // apapun errornya jangan sampai 500
    console.error("Middleware error:", err);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/teknisi/:path*", "/login-admin", "/login-teknisi", "/login-user", "/login"],
};

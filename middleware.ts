import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

export const runtime = "nodejs";

const AUTH_SECRET = process.env.AUTH_SECRET ?? "";
const COOKIE_NAME = "ux_auth";

// Constant-time HMAC verification — prevents timing attacks
function verifyToken(token: string): boolean {
  if (!AUTH_SECRET) return false;
  try {
    const dot = token.lastIndexOf(".");
    if (dot === -1) return false;
    const payload = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    const expected = createHmac("sha256", AUTH_SECRET).update(payload).digest("hex");
    if (sig.length !== expected.length) return false;
    // Bitwise OR accumulates any differing bits — constant-time comparison
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
    return diff === 0;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow: login page, auth API, Next.js internals, public assets
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // If SITE_PASSWORD is not configured, bypass auth in dev
  if (!process.env.SITE_PASSWORD) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value ?? "";

  if (!verifyToken(token)) {
    const loginUrl = new URL("/login", request.url);
    // Preserve the originally requested path so we can redirect back after login
    if (pathname !== "/") loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.webp).*)"],
};

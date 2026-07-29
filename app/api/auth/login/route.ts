import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

const SITE_PASSWORD = process.env.SITE_PASSWORD ?? "";
const AUTH_SECRET = process.env.AUTH_SECRET ?? "";
const COOKIE_NAME = "ux_auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Rate limiting: max 5 attempts per IP per 15 minutes
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function makeToken(): string {
  const payload = `auth.${Date.now()}.${Math.random().toString(36).slice(2)}`;
  const sig = createHmac("sha256", AUTH_SECRET).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

// Constant-time string comparison — prevents timing attacks on password check
function safeEqual(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) {
      // Still run comparison to avoid length-based timing leak
      timingSafeEqual(bufA, bufA);
      return false;
    }
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  // ── Rate limiting ────────────────────────────────────────────────────────
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (entry && now < entry.resetAt) {
    if (entry.count >= 5) {
      return NextResponse.json(
        { error: "Too many attempts. Try again in 15 minutes." },
        { status: 429 }
      );
    }
    entry.count++;
  } else {
    loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
  }

  // ── Validate body ────────────────────────────────────────────────────────
  let password: string;
  try {
    const body = await request.json();
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // ── Check password ───────────────────────────────────────────────────────
  if (!SITE_PASSWORD || !AUTH_SECRET || !safeEqual(password, SITE_PASSWORD)) {
    // Same response shape for wrong password and missing env vars — no enumeration
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  // ── Issue session cookie ─────────────────────────────────────────────────
  const token = makeToken();
  const response = NextResponse.json({ ok: true });

  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,                                          // not readable by JS
    secure: process.env.NODE_ENV === "production",          // HTTPS only in prod
    sameSite: "strict",                                     // no cross-site send
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return response;
}

import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent clickjacking — this page should never be embedded in an iframe
  { key: "X-Frame-Options", value: "DENY" },
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Only send the origin in the Referer header (no full path)
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable browser features this app doesn't need
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Content Security Policy
  // - default-src 'self': block everything not explicitly allowed
  // - script-src: allow Next.js inline scripts (needed for hydration)
  // - style-src: allow inline styles (Tailwind + framer-motion inject them)
  // - img-src: allow blob: for the image preview (FileReader creates a data URL)
  // - connect-src: allow calls to our own API and Anthropic (via server, but also font CDNs)
  // - font-src: Google Fonts CDN used by next/font
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval required by Next.js dev mode; safe in prod build
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const ease = [0.2, 0, 0, 1.0] as const;

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") ?? "/";

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!password || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push(redirectTo);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "Incorrect password.");
        setPassword("");
        inputRef.current?.focus();
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6"
      style={{
        background: "linear-gradient(135deg, #2A1FA8 0%, #5B21B6 50%, #7C3AED 100%)",
      }}
    >
      <motion.div
        className="w-full max-w-sm flex flex-col gap-8"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease }}
      >
        {/* Logo / title */}
        <div className="flex flex-col gap-1 text-center">
          <h1
            className="text-2xl font-light tracking-tight"
            style={{ color: "#FFFFFF" }}
          >
            Gabriele Ucar
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
            Enter the access password to continue
          </p>
        </div>

        {/* Form card */}
        <div
          className="flex flex-col gap-5 p-8"
          style={{
            background: "rgba(8, 6, 20, 0.55)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: "var(--md-shape-xl)",
            border: "1.5px solid rgba(255,255,255,0.10)",
          }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            {/* Password field */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="password"
                className="text-xs font-medium"
                style={{ color: "rgba(255,255,255,0.65)" }}
              >
                Password
              </label>
              <input
                ref={inputRef}
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
                aria-describedby={error ? "login-error" : undefined}
                aria-invalid={!!error}
                className="w-full px-4 py-3 text-sm outline-none"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: error
                    ? "1.5px solid rgba(249, 115, 115, 0.7)"
                    : "1.5px solid rgba(255,255,255,0.15)",
                  borderRadius: "var(--md-shape-md)",
                  color: "#FFFFFF",
                  caretColor: "var(--md-primary)",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--md-primary)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = error
                    ? "rgba(249, 115, 115, 0.7)"
                    : "rgba(255,255,255,0.15)")
                }
              />
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.p
                  id="login-error"
                  role="alert"
                  className="text-xs"
                  style={{ color: "rgba(249, 115, 115, 0.9)" }}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={!password || loading}
              className="w-full py-3 text-sm font-medium transition-opacity"
              style={{
                backgroundColor: "var(--md-primary)",
                color: "var(--md-on-primary)",
                borderRadius: "var(--md-shape-full)",
                border: "none",
                cursor: !password || loading ? "not-allowed" : "pointer",
                opacity: !password || loading ? 0.5 : 1,
              }}
            >
              {loading ? "Verifying…" : "Enter"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

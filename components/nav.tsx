"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navLinks } from "@/lib/nav";

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Skip-to-content — WCAG 2.4.1 */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-full focus:text-sm focus:font-medium"
        style={{
          backgroundColor: "var(--md-primary)",
          color: "var(--md-on-primary)",
        }}
      >
        Vai al contenuto principale
      </a>

      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{ backgroundColor: "var(--md-surface-container)" }}
      >
        <div className="flex items-center px-6" style={{ minHeight: "64px" }}>

          {/* Logo — aria-label per screen reader, WCAG 2.4.6 */}
          <Link
            href="/"
            aria-label="Home — Gabriele Ucar"
            className="md-interactive flex items-center justify-center rounded-full text-sm font-medium tracking-wide"
            style={{
              color: "var(--md-on-surface)",
              minWidth: "44px",
              minHeight: "44px",
              borderRadius: "var(--md-shape-full)",
            }}
          >
            GU
          </Link>

          {/* Nav desktop — centrata */}
          <nav aria-label="Navigazione principale" className="hidden md:flex flex-1 justify-center">
            <ul className="flex items-center gap-1" role="list">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={isActive ? "page" : undefined}
                      className="md-interactive flex items-center rounded-full px-4 text-sm font-medium"
                      style={{
                        backgroundColor: isActive
                          ? "var(--md-primary-container)"
                          : "transparent",
                        color: isActive
                          ? "var(--md-on-primary-container)"
                          : "var(--md-on-surface-variant)",
                        borderRadius: "var(--md-shape-full)",
                        minHeight: "44px",
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Hamburger — touch target 44×44px, WCAG 2.5.5 */}
          <button
            className="md-interactive flex md:hidden items-center justify-center ml-auto rounded-full"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Chiudi menu" : "Apri menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            style={{
              minWidth: "44px",
              minHeight: "44px",
              borderRadius: "var(--md-shape-full)",
            }}
          >
            <span className="flex flex-col gap-1.5" aria-hidden="true">
              <span
                className="block h-0.5 w-5 transition-all duration-300"
                style={{
                  backgroundColor: "var(--md-on-surface)",
                  transform: open ? "translateY(8px) rotate(45deg)" : "none",
                }}
              />
              <span
                className="block h-0.5 w-5 transition-all duration-300"
                style={{
                  backgroundColor: "var(--md-on-surface)",
                  opacity: open ? 0 : 1,
                }}
              />
              <span
                className="block h-0.5 w-5 transition-all duration-300"
                style={{
                  backgroundColor: "var(--md-on-surface)",
                  transform: open ? "translateY(-8px) rotate(-45deg)" : "none",
                }}
              />
            </span>
          </button>
        </div>

        {/* Menu mobile */}
        {open && (
          <nav id="mobile-menu" aria-label="Navigazione mobile" className="md:hidden px-4 pb-4">
            <ul className="flex flex-col gap-1" role="list">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className="md-interactive flex items-center px-4 text-sm font-medium"
                      style={{
                        backgroundColor: isActive
                          ? "var(--md-primary-container)"
                          : "transparent",
                        color: isActive
                          ? "var(--md-on-primary-container)"
                          : "var(--md-on-surface-variant)",
                        borderRadius: "var(--md-shape-lg)",
                        minHeight: "44px",
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </header>
    </>
  );
}

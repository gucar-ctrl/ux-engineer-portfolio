"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navLinks } from "@/lib/nav";

const identityLinks = navLinks.filter((l) => l.group === "identity");
const workLinks = navLinks.filter((l) => l.group === "work");

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Skip-to-content — WCAG 2.4.1 */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-full focus:text-sm focus:font-medium"
        style={{ backgroundColor: "var(--md-primary)", color: "var(--md-on-primary)" }}
      >
        Skip to main content
      </a>

      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{ backgroundColor: "var(--md-surface-container)" }}
      >
        <div className="flex items-center px-6" style={{ minHeight: "64px" }}>

          <Link
            href="/"
            aria-label="Home — Gabriele Ucar, UX Technologist"
            className="md-interactive flex items-center gap-2 rounded-full text-sm font-medium tracking-wide px-2"
            style={{
              color: "var(--md-on-surface)",
              minWidth: "44px",
              minHeight: "44px",
              borderRadius: "var(--md-shape-full)",
            }}
          >
            GU
            <span
              className="text-xs font-medium px-1.5 py-0.5"
              style={{
                backgroundColor: "var(--md-primary-container)",
                color: "var(--md-on-primary-container)",
                borderRadius: "var(--md-shape-xs)",
                letterSpacing: "0.02em",
                lineHeight: 1,
              }}
            >
              beta
            </span>
          </Link>

          <nav aria-label="Main navigation" className="hidden md:flex flex-1 justify-center">
            <ul className="flex items-center gap-1" role="list">
              {/* Identity group: Home + About */}
              {identityLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={isActive ? "page" : undefined}
                      className="md-interactive flex items-center px-4 text-sm font-medium"
                      style={{
                        backgroundColor: isActive ? "var(--md-primary-container)" : "transparent",
                        color: isActive ? "var(--md-on-primary-container)" : "var(--md-on-surface)",
                        borderRadius: "var(--md-shape-full)",
                        minHeight: "44px",
                        fontWeight: 500,
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}

              {/* Separator */}
              <li aria-hidden="true" style={{ width: 1, height: 20, backgroundColor: "var(--md-outline-variant)", margin: "0 4px", flexShrink: 0 }} />

              {/* Work group: projects */}
              {workLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={isActive ? "page" : undefined}
                      className="md-interactive flex items-center px-4 text-sm font-medium"
                      style={{
                        backgroundColor: isActive ? "var(--md-primary-container)" : "transparent",
                        color: isActive ? "var(--md-on-primary-container)" : "var(--md-on-surface-variant)",
                        borderRadius: "var(--md-shape-full)",
                        minHeight: "44px",
                        fontWeight: 400,
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <button
            className="md-interactive flex md:hidden items-center justify-center ml-auto rounded-full"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            style={{ minWidth: "44px", minHeight: "44px", borderRadius: "var(--md-shape-full)" }}
          >
            <span className="flex flex-col gap-1.5" aria-hidden="true">
              <span className="block h-0.5 w-5 transition-all duration-300" style={{ backgroundColor: "var(--md-on-surface)", transform: open ? "translateY(8px) rotate(45deg)" : "none" }} />
              <span className="block h-0.5 w-5 transition-all duration-300" style={{ backgroundColor: "var(--md-on-surface)", opacity: open ? 0 : 1 }} />
              <span className="block h-0.5 w-5 transition-all duration-300" style={{ backgroundColor: "var(--md-on-surface)", transform: open ? "translateY(-8px) rotate(-45deg)" : "none" }} />
            </span>
          </button>
        </div>

        {open && (
          <nav id="mobile-menu" aria-label="Mobile navigation" className="md:hidden px-4 pb-4">
            <ul className="flex flex-col gap-1" role="list">
              {identityLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className="md-interactive flex items-center px-4 text-sm font-medium"
                      style={{
                        backgroundColor: isActive ? "var(--md-primary-container)" : "transparent",
                        color: isActive ? "var(--md-on-primary-container)" : "var(--md-on-surface)",
                        borderRadius: "var(--md-shape-lg)",
                        minHeight: "44px",
                        fontWeight: 500,
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
              <li aria-hidden="true" style={{ height: 1, backgroundColor: "var(--md-outline-variant)", margin: "4px 0" }} />
              {workLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className="md-interactive flex items-center px-4 text-sm font-medium"
                      style={{
                        backgroundColor: isActive ? "var(--md-primary-container)" : "transparent",
                        color: isActive ? "var(--md-on-primary-container)" : "var(--md-on-surface-variant)",
                        borderRadius: "var(--md-shape-lg)",
                        minHeight: "44px",
                        fontWeight: 400,
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

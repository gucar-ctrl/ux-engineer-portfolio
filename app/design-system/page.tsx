"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Check } from "lucide-react";
import { useActiveSection } from "@/lib/use-active-section";

const ease = [0.2, 0, 0, 1.0] as const;

// ─── Data ────────────────────────────────────────────────────────────────────

const colorTokens = [
  { token: "--md-primary",                value: "#D0BCFF", label: "Primary" },
  { token: "--md-on-primary",             value: "#381E72", label: "On Primary" },
  { token: "--md-primary-container",      value: "#4F378B", label: "Primary Container" },
  { token: "--md-on-primary-container",   value: "#EADDFF", label: "On Primary Container" },
  { token: "--md-secondary",              value: "#CCC2DC", label: "Secondary" },
  { token: "--md-on-secondary",           value: "#332D41", label: "On Secondary" },
  { token: "--md-secondary-container",    value: "#4A4458", label: "Secondary Container" },
  { token: "--md-on-secondary-container", value: "#E8DEF8", label: "On Secondary Container" },
  { token: "--md-background",             value: "#1C1B1F", label: "Background" },
  { token: "--md-on-background",          value: "#E6E1E5", label: "On Background" },
  { token: "--md-surface",                value: "#1C1B1F", label: "Surface" },
  { token: "--md-on-surface",             value: "#E6E1E5", label: "On Surface" },
  { token: "--md-surface-variant",        value: "#49454F", label: "Surface Variant" },
  { token: "--md-on-surface-variant",     value: "#CAC4D0", label: "On Surface Variant" },
  { token: "--md-surface-container",      value: "#211F26", label: "Surface Container" },
  { token: "--md-surface-container-high", value: "#2B2930", label: "Surface Container High" },
  { token: "--md-outline",                value: "#938F99", label: "Outline" },
  { token: "--md-outline-variant",        value: "#49454F", label: "Outline Variant" },
  { token: "--md-error",                  value: "#F2B8B5", label: "Error" },
  { token: "--md-on-error",               value: "#601410", label: "On Error" },
];

const typographyTokens = [
  { label: "Display",  size: "3.5rem",  weight: "300", sample: "Display" },
  { label: "Headline", size: "2rem",    weight: "400", sample: "Headline" },
  { label: "Title",    size: "1.75rem", weight: "500", sample: "Title" },
  { label: "Body",     size: "1.25rem", weight: "400", sample: "Body text — default for paragraphs and descriptions." },
  { label: "Label",    size: "1rem",    weight: "500", sample: "Label — used for tags, chips, and eyebrow text." },
];

const shapeTokens = [
  { token: "--md-shape-xs",   value: "4px",    label: "XS" },
  { token: "--md-shape-sm",   value: "8px",    label: "SM" },
  { token: "--md-shape-md",   value: "12px",   label: "MD" },
  { token: "--md-shape-lg",   value: "16px",   label: "LG" },
  { token: "--md-shape-xl",   value: "28px",   label: "XL" },
  { token: "--md-shape-full", value: "9999px", label: "Full" },
];

const motionTokens = [
  { token: "--md-easing-standard",   value: "cubic-bezier(0.2, 0, 0, 1.0)",     label: "Standard",   duration: "200ms" },
  { token: "--md-easing-decelerate", value: "cubic-bezier(0.05, 0.7, 0.1, 1.0)", label: "Decelerate", duration: "300ms" },
  { token: "--md-easing-accelerate", value: "cubic-bezier(0.3, 0, 0.8, 0.15)",  label: "Accelerate", duration: "200ms" },
];

const navItems = [
  { id: "tokens",     label: "Tokens",     indent: false },
  { id: "colors",     label: "Colors",     indent: true },
  { id: "typography", label: "Typography", indent: true },
  { id: "shape",      label: "Shape",      indent: true },
  { id: "motion",     label: "Motion",     indent: true },
  { id: "components", label: "Components", indent: false },
  { id: "buttons",    label: "Buttons",    indent: true },
  { id: "chips",      label: "Chips",      indent: true },
  { id: "cards",      label: "Cards",      indent: true },
  { id: "inputs",     label: "Inputs",     indent: true },
] as const;

const navIds = navItems.map((n) => n.id);

// ─── W3C Design Tokens export ────────────────────────────────────────────────

function buildTokensJson() {
  return {
    color: Object.fromEntries(
      colorTokens.map((t) => [
        t.token.replace("--md-", "").replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase()),
        { $value: t.value, $type: "color", $description: t.label },
      ])
    ),
    shape: Object.fromEntries(
      shapeTokens.map((t) => [
        t.token.replace("--md-shape-", ""),
        { $value: t.value, $type: "dimension", $description: `Shape ${t.label}` },
      ])
    ),
    motion: {
      duration: {
        short:  { $value: "200ms", $type: "duration" },
        medium: { $value: "300ms", $type: "duration" },
        long:   { $value: "500ms", $type: "duration" },
      },
      easing: {
        standard:   { $value: "cubic-bezier(0.2, 0, 0, 1.0)",     $type: "cubicBezier" },
        decelerate: { $value: "cubic-bezier(0.05, 0.7, 0.1, 1.0)", $type: "cubicBezier" },
        accelerate: { $value: "cubic-bezier(0.3, 0, 0.8, 0.15)",  $type: "cubicBezier" },
      },
    },
    typography: {
      fontFamily: { $value: "Roboto", $type: "fontFamily" },
      fontWeight: {
        light:   { $value: 300, $type: "fontWeight" },
        regular: { $value: 400, $type: "fontWeight" },
        medium:  { $value: 500, $type: "fontWeight" },
        bold:    { $value: 700, $type: "fontWeight" },
      },
    },
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// NAV_HEIGHT + extra breathing room so heading is never hidden behind the fixed nav
const SCROLL_OFFSET = 88;

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
  window.scrollTo({ top, behavior: "smooth" });
}

function SectionAnchor({ id }: { id: string }) {
  return <div id={id} style={{ scrollMarginTop: SCROLL_OFFSET }} />;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DesignSystem() {
  const [downloaded, setDownloaded] = useState(false);
  const [activeId, setActiveId] = useActiveSection(navIds);
  const [activeInput, setActiveInput] = useState<string | null>(null);
  const [inputValues, setInputValues] = useState({ default: "", error: "invalid@" });

  function handleExport() {
    const json = JSON.stringify(buildTokensJson(), null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "design-tokens.json";
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--md-background)" }}>

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <motion.aside
        className="hidden md:flex flex-col gap-1 px-4 shrink-0"
        style={{
          width: 210,
          position: "sticky",
          top: 64,
          height: "calc(100vh - 64px)",
          overflowY: "auto",
          paddingTop: "2rem",
          paddingBottom: "2rem",
          borderRight: "1px solid color-mix(in srgb, var(--md-outline) 20%, transparent)",
        }}
        aria-label="Design system navigation"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease }}
      >
        {navItems.map((item) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { setActiveId(item.id); scrollTo(item.id); }}
              className="md-interactive text-left px-3 py-2 text-sm"
              style={{
                borderRadius: "var(--md-shape-md)",
                background: isActive ? "var(--md-primary-container)" : "none",
                color: isActive
                  ? "var(--md-on-primary-container)"
                  : item.indent ? "var(--md-on-surface-variant)" : "var(--md-on-surface)",
                fontWeight: isActive ? 500 : item.indent ? 400 : 500,
                paddingLeft: item.indent ? "1.5rem" : "0.75rem",
                border: "none",
                cursor: "pointer",
                transition: "background-color var(--md-duration-short) var(--md-easing-standard), color var(--md-duration-short) var(--md-easing-standard)",
              }}
            >
              {item.label}
            </button>
          );
        })}

        <div style={{ marginTop: "auto", paddingTop: "1.5rem" }}>
          <button
            onClick={handleExport}
            className="md-interactive inline-flex items-center gap-2 px-3 py-2 text-xs font-medium w-full justify-center"
            style={{
              backgroundColor: downloaded ? "var(--md-primary-container)" : "var(--md-surface-container)",
              color: downloaded ? "var(--md-on-primary-container)" : "var(--md-on-surface-variant)",
              border: "1px solid var(--md-outline)",
              borderRadius: "var(--md-shape-md)",
              cursor: "pointer",
              transition: "all var(--md-duration-short) var(--md-easing-standard)",
              minHeight: 44,
            }}
          >
            {downloaded
              ? <><Check size={13} aria-hidden="true" /> Downloaded</>
              : <><Download size={13} aria-hidden="true" /> Export JSON</>
            }
          </button>
        </div>
      </motion.aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main id="main-content" className="flex-1 min-w-0" tabIndex={-1}>
        <div className="px-10 pt-24 pb-32 max-w-5xl">

          {/* Page header */}
          <div className="mb-16">
            <motion.span
              className="inline-block px-3 py-1 text-xs font-medium mb-4"
              style={{
                backgroundColor: "var(--md-primary-container)",
                color: "var(--md-on-primary-container)",
                borderRadius: "var(--md-shape-full)",
              }}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.35 }}
            >
              Design Systems
            </motion.span>
            <motion.h1
              className="text-5xl font-light tracking-tight"
              style={{ color: "var(--md-on-background)" }}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease, delay: 0.5 }}
            >
              Design System Explorer
            </motion.h1>
            <motion.p
              className="mt-4 text-lg max-w-xl"
              style={{ color: "var(--md-on-surface-variant)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.65 }}
            >
              The tokens and components that make up this portfolio — built on Material Design 3.
            </motion.p>
            <motion.button
              onClick={handleExport}
              className="md-interactive inline-flex items-center gap-2 px-4 py-2 text-sm font-medium mt-6 md:hidden"
              style={{
                backgroundColor: "var(--md-surface-container)",
                color: "var(--md-on-surface-variant)",
                border: "1px solid var(--md-outline)",
                borderRadius: "var(--md-shape-full)",
                cursor: "pointer",
                minHeight: 44,
              }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.8 }}
            >
              <Download size={14} aria-hidden="true" /> Export JSON
            </motion.button>
          </div>

          {/* ══════════════════════════════════════════
              TOKENS
          ══════════════════════════════════════════ */}
          <SectionAnchor id="tokens" />
          <p className="text-xs font-medium tracking-widest uppercase mb-10" style={{ color: "var(--md-on-surface-variant)" }}>
            Tokens
          </p>

          {/* ── Colors ── */}
          <SectionAnchor id="colors" />
          <h2 className="text-base font-medium mb-6" style={{ color: "var(--md-on-surface)" }}>Colors</h2>
          <div
            className="grid gap-5 mb-20"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))" }}
          >
            {colorTokens.map((t) => (
              <div key={t.token} className="flex flex-col gap-3">
                <div
                  style={{
                    backgroundColor: t.value,
                    borderRadius: "var(--md-shape-lg)",
                    height: 64,
                    border: "1px solid color-mix(in srgb, var(--md-outline) 25%, transparent)",
                  }}
                />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium" style={{ color: "var(--md-on-surface)" }}>
                    {t.label}
                  </span>
                  <span className="text-xs font-mono" style={{ color: "var(--md-on-surface-variant)" }}>
                    {t.value}
                  </span>
                  <span style={{ fontSize: "1rem", fontFamily: "monospace", color: "var(--md-outline)" }}>
                    {t.token}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Typography ── */}
          <SectionAnchor id="typography" />
          <h2 className="text-base font-medium mb-6" style={{ color: "var(--md-on-surface)" }}>Typography</h2>
          <div
            className="flex flex-col mb-20"
            style={{
              backgroundColor: "var(--md-surface-container)",
              borderRadius: "var(--md-shape-xl)",
              overflow: "hidden",
            }}
          >
            {typographyTokens.map((t, i) => (
              <div
                key={t.label}
                className="flex items-baseline justify-between gap-8 px-8 py-6"
                style={{
                  borderBottom: i < typographyTokens.length - 1
                    ? "1px solid color-mix(in srgb, var(--md-outline) 15%, transparent)"
                    : "none",
                }}
              >
                <span
                  style={{
                    fontSize: t.size,
                    fontWeight: t.weight,
                    color: "var(--md-on-surface)",
                    lineHeight: 1.2,
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {t.sample}
                </span>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-xs font-medium" style={{ color: "var(--md-on-surface-variant)" }}>
                    {t.label}
                  </span>
                  <span className="text-xs font-mono" style={{ color: "var(--md-outline)" }}>
                    {t.size} / {t.weight}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Shape ── */}
          <SectionAnchor id="shape" />
          <h2 className="text-base font-medium mb-6" style={{ color: "var(--md-on-surface)" }}>Shape</h2>
          <div
            className="grid gap-8 mb-20"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))" }}
          >
            {shapeTokens.map((t) => (
              <div key={t.token} className="flex flex-col items-center gap-4">
                <div
                  style={{
                    width: 80,
                    height: 80,
                    backgroundColor: "var(--md-primary-container)",
                    borderRadius: t.value === "9999px" ? "9999px" : t.value,
                  }}
                />
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-xs font-medium" style={{ color: "var(--md-on-surface)" }}>{t.label}</span>
                  <span className="text-xs font-mono" style={{ color: "var(--md-on-surface-variant)" }}>{t.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Motion ── */}
          <SectionAnchor id="motion" />
          <h2 className="text-base font-medium mb-6" style={{ color: "var(--md-on-surface)" }}>Motion</h2>
          <div className="grid gap-4 mb-20" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {motionTokens.map((t) => (
              <div
                key={t.token}
                className="flex items-center justify-between gap-6 px-6 py-5"
                style={{
                  backgroundColor: "var(--md-surface-container)",
                  borderRadius: "var(--md-shape-xl)",
                }}
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium" style={{ color: "var(--md-on-surface)" }}>{t.label}</span>
                  <span className="text-xs font-mono" style={{ color: "var(--md-on-surface-variant)" }}>{t.duration}</span>
                  <span style={{ fontSize: "1rem", fontFamily: "monospace", color: "var(--md-outline)" }}>{t.token}</span>
                </div>
                {/* Animated demo */}
                <div style={{ width: 60, height: 16, position: "relative", flexShrink: 0 }} aria-hidden="true">
                  <style>{`
                    @keyframes slide-${t.label.toLowerCase()} {
                      0%, 100% { transform: translateX(0); }
                      50% { transform: translateX(40px); }
                    }
                  `}</style>
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      backgroundColor: "var(--md-primary)",
                      animation: `slide-${t.label.toLowerCase()} 2s ${t.value} infinite`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* ══════════════════════════════════════════
              COMPONENTS
          ══════════════════════════════════════════ */}
          <SectionAnchor id="components" />
          <p className="text-xs font-medium tracking-widest uppercase mb-10" style={{ color: "var(--md-on-surface-variant)" }}>
            Components
          </p>

          {/* ── Buttons ── */}
          <SectionAnchor id="buttons" />
          <h2 className="text-base font-medium mb-6" style={{ color: "var(--md-on-surface)" }}>Buttons</h2>
          <div
            className="grid gap-px mb-20"
            style={{
              backgroundColor: "color-mix(in srgb, var(--md-outline) 15%, transparent)",
              borderRadius: "var(--md-shape-xl)",
              overflow: "hidden",
              gridTemplateColumns: "repeat(3, 1fr)",
            }}
          >
            {[
              { variant: "Filled",   bg: "var(--md-primary)",    color: "var(--md-on-primary)", border: "none" },
              { variant: "Outlined", bg: "transparent",           color: "var(--md-primary)",   border: "1.5px solid var(--md-outline)" },
              { variant: "Text",     bg: "transparent",           color: "var(--md-primary)",   border: "none" },
            ].map((v) => (
              <div
                key={v.variant}
                className="flex flex-col gap-6 px-8 py-8"
                style={{ backgroundColor: "var(--md-surface-container)" }}
              >
                <span className="text-xs font-medium" style={{ color: "var(--md-on-surface-variant)" }}>{v.variant}</span>
                <div className="flex flex-col gap-4">
                  <button
                    className="md-interactive inline-flex items-center justify-center px-6 py-3 text-sm font-medium self-start"
                    style={{
                      backgroundColor: v.bg,
                      color: v.color,
                      border: v.border,
                      borderRadius: "var(--md-shape-full)",
                      minHeight: 44,
                      cursor: "pointer",
                    }}
                  >
                    Default
                  </button>
                  <button
                    className="md-interactive inline-flex items-center justify-center px-6 py-3 text-sm font-medium self-start"
                    style={{
                      backgroundColor: v.bg,
                      color: "var(--md-on-surface-variant)",
                      border: v.border || "none",
                      borderColor: v.border ? "var(--md-outline-variant)" : undefined,
                      borderRadius: "var(--md-shape-full)",
                      minHeight: 44,
                      opacity: 0.38,
                      cursor: "not-allowed",
                    }}
                    disabled
                  >
                    Disabled
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ── Chips ── */}
          <SectionAnchor id="chips" />
          <h2 className="text-base font-medium mb-6" style={{ color: "var(--md-on-surface)" }}>Chips</h2>
          <div
            className="flex flex-wrap gap-4 px-8 py-8 mb-20"
            style={{
              backgroundColor: "var(--md-surface-container)",
              borderRadius: "var(--md-shape-xl)",
            }}
          >
            {[
              { label: "AI + UX",        bg: "var(--md-primary-container)",    color: "var(--md-on-primary-container)" },
              { label: "Design Systems", bg: "var(--md-secondary-container)",  color: "var(--md-on-secondary-container)" },
              { label: "Motion + Code",  bg: "var(--md-secondary-container)",  color: "var(--md-on-secondary-container)" },
              { label: "Coming soon",    bg: "#4E3800",                         color: "#FFDEA8" },
              { label: "High",           bg: "#4E0000",                         color: "#FFDAD6" },
              { label: "Medium",         bg: "#4E3800",                         color: "#FFDEA8" },
              { label: "Low",            bg: "#003823",                         color: "#9EF2C4" },
            ].map((chip) => (
              <span
                key={chip.label}
                className="inline-block px-3 py-1 text-xs font-medium"
                style={{
                  backgroundColor: chip.bg,
                  color: chip.color,
                  borderRadius: "var(--md-shape-full)",
                }}
              >
                {chip.label}
              </span>
            ))}
          </div>

          {/* ── Cards ── */}
          <SectionAnchor id="cards" />
          <h2 className="text-base font-medium mb-6" style={{ color: "var(--md-on-surface)" }}>Cards</h2>
          <div
            className="grid gap-5 mb-20"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
          >
            {[
              {
                label: "Filled",
                bg: "var(--md-surface-container-high)",
                border: "none",
                desc: "Used for elevated content areas and result panels.",
              },
              {
                label: "Outlined",
                bg: "var(--md-background)",
                border: "1.5px solid var(--md-outline)",
                desc: "Used to visually separate sections with a clear boundary.",
              },
              {
                label: "Dashed",
                bg: "transparent",
                border: "1.5px dashed var(--md-outline)",
                desc: "Used for coming soon cards and placeholder states.",
              },
            ].map((card) => (
              <div
                key={card.label}
                className="flex flex-col gap-3 p-7"
                style={{
                  backgroundColor: card.bg,
                  border: card.border,
                  borderRadius: "var(--md-shape-xl)",
                }}
              >
                <span className="text-xs font-medium" style={{ color: "var(--md-on-surface-variant)" }}>
                  {card.label}
                </span>
                <p className="text-sm font-medium" style={{ color: "var(--md-on-surface)" }}>
                  Card title
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--md-on-surface-variant)" }}>
                  {card.desc}
                </p>
              </div>
            ))}
          </div>

          {/* ── Inputs ── */}
          <SectionAnchor id="inputs" />
          <h2 className="text-base font-medium mb-6" style={{ color: "var(--md-on-surface)" }}>Inputs</h2>
          <div
            className="grid gap-8 px-8 py-8 mb-20"
            style={{
              backgroundColor: "var(--md-surface-container)",
              borderRadius: "var(--md-shape-xl)",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            }}
          >
            {/* Default */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium" style={{ color: "var(--md-on-surface-variant)" }}>
                Default
              </label>
              <input
                type="text"
                placeholder="Placeholder text"
                value={inputValues.default}
                onFocus={() => setActiveInput("default")}
                onBlur={() => setActiveInput(null)}
                onChange={(e) => setInputValues((v) => ({ ...v, default: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  fontSize: "1.125rem",
                  backgroundColor: "var(--md-surface-container-high)",
                  color: "var(--md-on-surface)",
                  border: activeInput === "default"
                    ? "1.5px solid var(--md-primary)"
                    : "1.5px solid var(--md-outline)",
                  borderRadius: "var(--md-shape-md)",
                  outline: "none",
                  transition: "border-color var(--md-duration-short) var(--md-easing-standard)",
                  minHeight: 44,
                }}
              />
              <span className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>
                Helper text — hints or formatting rules.
              </span>
            </div>

            {/* Error */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium" style={{ color: "#F2B8B5" }}>
                Error
              </label>
              <input
                type="email"
                value={inputValues.error}
                onFocus={() => setActiveInput("error")}
                onBlur={() => setActiveInput(null)}
                onChange={(e) => setInputValues((v) => ({ ...v, error: e.target.value }))}
                aria-invalid="true"
                aria-describedby="error-msg"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  fontSize: "1.125rem",
                  backgroundColor: "var(--md-surface-container-high)",
                  color: "var(--md-on-surface)",
                  border: "1.5px solid #F2B8B5",
                  borderRadius: "var(--md-shape-md)",
                  outline: "none",
                  minHeight: 44,
                }}
              />
              <span id="error-msg" className="text-xs" style={{ color: "#F2B8B5" }}>
                Enter a valid email address.
              </span>
            </div>

            {/* Disabled */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium" style={{ color: "var(--md-outline)" }}>
                Disabled
              </label>
              <input
                type="text"
                placeholder="Not editable"
                disabled
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  fontSize: "1.125rem",
                  backgroundColor: "var(--md-surface-container-high)",
                  color: "var(--md-outline)",
                  border: "1.5px solid var(--md-outline-variant)",
                  borderRadius: "var(--md-shape-md)",
                  outline: "none",
                  opacity: 0.38,
                  cursor: "not-allowed",
                  minHeight: 44,
                }}
              />
              <span className="text-xs" style={{ color: "var(--md-outline)" }}>
                This field is not editable.
              </span>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Copy, Check, ListChecks, Ear, ChevronDown, Activity, Zap } from "lucide-react";

const ease = [0.2, 0, 0, 1.0] as const;

// ─── Types ───────────────────────────────────────────────────────────────────

type ScreenReaderItem = {
  index: number;
  element: string;
  announcement: string;
  states: string[];
  live: string[];
};

type ScreenReaderSection = {
  section: string;
  items: ScreenReaderItem[];
};

type Analysis = {
  ui_update: string[];
  screen_reader: ScreenReaderSection[];
};

type ModelId = "claude-sonnet-4-5" | "claude-haiku-4-5-20251001";

// ─── Constants ───────────────────────────────────────────────────────────────

const LOADING_STEPS = [
  "Uploading image",
  "Analyzing layout and contrast",
  "Checking touch targets and labels",
  "Building screen reader map",
];

const MODELS: { id: ModelId; label: string; description: string; icon: "sonnet" | "haiku" }[] = [
  {
    id: "claude-sonnet-4-5",
    label: "Sonnet 4.5",
    description: "My default. Catches subtle hierarchy and copy issues, not just contrast.",
    icon: "sonnet",
  },
  {
    id: "claude-haiku-4-5-20251001",
    label: "Haiku",
    description: "Use for quick passes. Good at WCAG rule violations; less nuance on intent.",
    icon: "haiku",
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function UXAccessibilityReviewer() {
  const [image, setImage] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<string>("image/png");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelId>("claude-sonnet-4-5");
  const [usedModel, setUsedModel] = useState<ModelId | null>(null);
  const [expanded, setExpanded] = useState<{ ui: boolean; sr: boolean }>({ ui: false, sr: false });
  const inputRef = useRef<HTMLInputElement>(null);

  // Cycle through loading steps
  useEffect(() => {
    if (!loading) { setLoadingStep(0); return; }
    setLoadingStep(0);
    const timers = [
      setTimeout(() => setLoadingStep(1), 2000),
      setTimeout(() => setLoadingStep(2), 8000),
      setTimeout(() => setLoadingStep(3), 18000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [loading]);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, WebP).");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError("File too large. Please upload an image under 4 MB.");
      return;
    }
    setError(null);
    setAnalysis(null);
    setMediaType(file.type);
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  const handleAnalyze = useCallback(async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const base64 = image.split(",")[1];
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mediaType, model: selectedModel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error.");
      setUsedModel(selectedModel);
      setExpanded({ ui: false, sr: false });
      setAnalysis(data);
      setImage(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [image, mediaType, selectedModel]);

  // ⌘+Enter keyboard shortcut
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && image && !loading) {
        handleAnalyze();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [image, loading, handleAnalyze]);

  function handleRemove() {
    setImage(null);
    setAnalysis(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function copySection(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(id);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch { /* silent */ }
  }

  function buildUiUpdateText(items: string[]) {
    return items.join("\n");
  }

  function buildScreenReaderText(sections: ScreenReaderSection[]) {
    return sections.map((s) => {
      const items = s.items.map((item) => [
        `${item.index} — ${item.element}: "${item.announcement}"`,
        ...item.states.map((st) => `   ${st}`),
        ...item.live.map((l) => `   ${l}`),
      ].join("\n")).join("\n");
      return `${s.section}\n${items}`;
    }).join("\n\n");
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--md-background)" }}>

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <motion.aside
        className="hidden md:flex flex-col gap-8 shrink-0"
        style={{
          width: 272,
          position: "sticky",
          top: 64,
          height: "calc(100vh - 64px)",
          overflowY: "auto",
          padding: "2rem 1.25rem 2rem 1.5rem",
          borderRight: "1px solid color-mix(in srgb, var(--md-outline) 20%, transparent)",
        }}
        aria-label="Tool settings"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease }}
      >
        {/* Model selector */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1 mb-1">
            <p
              className="text-xs font-semibold tracking-widest"
              style={{ color: "var(--md-on-surface-variant)", letterSpacing: "0.1em" }}
            >
              AI MODEL
            </p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--md-on-surface-variant)", opacity: 0.75 }}>
              I&apos;ll send the screenshot to Claude. Sonnet is more thorough; Haiku is faster.
            </p>
          </div>

          <div className="flex flex-col gap-2" role="group" aria-label="AI model selection">
            {MODELS.map((m) => {
              const isActive = selectedModel === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => !loading && setSelectedModel(m.id)}
                  className="md-interactive flex items-start gap-3 px-4 py-3 text-left w-full"
                  style={{
                    border: isActive
                      ? "1.5px solid var(--md-primary)"
                      : "1.5px solid color-mix(in srgb, var(--md-outline) 50%, transparent)",
                    borderRadius: "var(--md-shape-lg)",
                    backgroundColor: isActive
                      ? "color-mix(in srgb, var(--md-primary-container) 60%, transparent)"
                      : "color-mix(in srgb, var(--md-surface-container) 60%, transparent)",
                    minHeight: 44,
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.5 : 1,
                    transition: "all var(--md-duration-short) var(--md-easing-standard)",
                  }}
                  aria-pressed={isActive}
                  disabled={loading}
                >
                  <span
                    className="mt-0.5 shrink-0"
                    style={{ color: isActive ? "var(--md-primary)" : "var(--md-on-surface-variant)" }}
                  >
                    {m.icon === "sonnet"
                      ? <Activity size={15} aria-hidden="true" />
                      : <Zap size={15} aria-hidden="true" />}
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span
                      className="text-sm font-medium"
                      style={{ color: isActive ? "var(--md-on-primary-container)" : "var(--md-on-surface)" }}
                    >
                      {m.label}
                    </span>
                    <span
                      className="text-xs leading-relaxed"
                      style={{ color: isActive ? "var(--md-on-primary-container)" : "var(--md-on-surface-variant)", opacity: 0.85 }}
                    >
                      {m.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main id="main-content" className="flex-1 min-w-0 flex flex-col" tabIndex={-1}>
        <div className="flex flex-col px-10 pt-8 pb-4 max-w-3xl w-full" style={{ height: "calc(100vh - 64px)" }}>

          {/* Badge */}
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease, delay: 0.35 }}
          >
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 text-xs"
              style={{
                border: "1.5px solid color-mix(in srgb, var(--md-outline) 60%, transparent)",
                borderRadius: "var(--md-shape-full)",
                color: "var(--md-on-surface-variant)",
                fontFamily: "monospace",
                letterSpacing: "0.05em",
              }}
            >
              <span
                style={{
                  width: 7, height: 7, borderRadius: "50%",
                  backgroundColor: "var(--md-primary)",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              AI TOOL · V0.3
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="mb-3 font-light tracking-tight"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1.1, color: "var(--md-on-background)" }}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease, delay: 0.5 }}
          >
            A UX{" "}
            <span style={{ color: "var(--md-primary)", fontWeight: 600 }}>
              accessibility
              <br />second opinion
            </span>
            ,
            <br />
            before the developer handoff.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="mb-5 max-w-xl text-sm leading-relaxed"
            style={{ color: "var(--md-on-surface-variant)" }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.65 }}
          >
            Drop a screenshot — I&apos;ll read it for contrast, focus order, label completeness,
            target sizes, and the small copy issues that usually only show up at the post-mortem.
            You&apos;ll get back a structured list with severity and a one-line fix per finding.
          </motion.p>

          {/* Upload / Preview / Loading */}
          <motion.div
            className="flex-1 flex flex-col min-h-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.8 }}
          >
            {loading ? (
              <div
                className="flex flex-col gap-2 p-6 flex-1 justify-center"
                style={{ backgroundColor: "var(--md-surface-container)", borderRadius: "var(--md-shape-xl)" }}
                role="status"
                aria-label="Analysis in progress"
              >
                <p className="text-xs font-medium mb-2 px-2" style={{ color: "var(--md-on-surface-variant)" }}>
                  Analyzing your screenshot…
                </p>
                {LOADING_STEPS.map((step, i) => {
                  const isDone = i < loadingStep;
                  const isActive = i === loadingStep;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-4 px-4 py-3"
                      style={{
                        borderRadius: "var(--md-shape-lg)",
                        backgroundColor: isActive ? "var(--md-surface-container-high)" : "transparent",
                        transition: "background-color var(--md-duration-short) var(--md-easing-standard)",
                      }}
                    >
                      <span
                        style={{
                          width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
                          backgroundColor: isDone
                            ? "var(--md-primary-container)"
                            : isActive
                              ? "var(--md-primary)"
                              : "var(--md-outline)",
                          boxShadow: isActive
                            ? "0 0 0 4px color-mix(in srgb, var(--md-primary) 20%, transparent)"
                            : "none",
                          transition: "all var(--md-duration-short) var(--md-easing-standard)",
                        }}
                      />
                      <span
                        className="text-sm"
                        style={{
                          color: isDone
                            ? "var(--md-on-surface-variant)"
                            : isActive
                              ? "var(--md-on-surface)"
                              : "var(--md-outline)",
                          fontWeight: isActive ? 500 : 400,
                          transition: "color var(--md-duration-short) var(--md-easing-standard)",
                        }}
                      >
                        {step}{isActive && <span aria-hidden="true">…</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : !image ? (
              <div
                role="button"
                tabIndex={0}
                aria-label="Image upload area. Click or drag a file to upload."
                className="md-interactive flex flex-col items-center justify-center gap-5 text-center cursor-pointer flex-1"
                style={{
                  border: `1.5px dashed ${dragging ? "var(--md-primary)" : "color-mix(in srgb, var(--md-outline) 60%, transparent)"}`,
                  borderRadius: "var(--md-shape-xl)",
                  backgroundColor: dragging
                    ? "color-mix(in srgb, var(--md-primary-container) 15%, transparent)"
                    : "var(--md-surface-container)",
                  padding: "1.5rem 2rem",
                  transition: "all var(--md-duration-short) var(--md-easing-standard)",
                }}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
              >
                {/* Upload icon circle */}
                <span
                  className="flex items-center justify-center"
                  style={{
                    width: 52, height: 52, borderRadius: "50%",
                    backgroundColor: "var(--md-primary-container)",
                  }}
                  aria-hidden="true"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 16V8M12 8L9 11M12 8L15 11"
                      stroke="var(--md-on-primary-container)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 16.5V18.75C3 19.9926 4.00736 21 5.25 21H18.75C19.9926 21 21 19.9926 21 18.75V16.5"
                      stroke="var(--md-on-primary-container)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <div>
                  <p className="text-base font-medium" style={{ color: "var(--md-on-surface)" }}>
                    Drop a screenshot here
                  </p>
                  <p className="text-sm mt-1" style={{ color: "var(--md-on-surface-variant)" }}>
                    PNG, JPG, or WebP — up to 4 MB.{" "}
                    Or press{" "}
                    <kbd
                      className="px-1.5 py-0.5 text-xs"
                      style={{
                        border: "1px solid var(--md-outline)",
                        borderRadius: 4,
                        fontFamily: "monospace",
                        color: "var(--md-on-surface-variant)",
                      }}
                    >
                      Enter
                    </kbd>{" "}
                    to browse.
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden flex-1" style={{ borderRadius: "var(--md-shape-xl)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt="Uploaded screenshot for analysis"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </motion.div>

          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            aria-hidden="true"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          {/* Error */}
          {error && (
            <p
              role="alert"
              className="mt-4 text-sm px-4 py-3"
              style={{ backgroundColor: "#4E0000", color: "#FFDAD6", borderRadius: "var(--md-shape-md)" }}
            >
              {error}
            </p>
          )}

          {/* CTA bar */}
          {!loading && (
            <motion.div
              className="flex items-center gap-3 mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, ease, delay: 0.9 }}
            >
              {/* Analyze */}
              <button
                onClick={handleAnalyze}
                disabled={!image}
                className="md-interactive inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium"
                style={{
                  backgroundColor: "transparent",
                  color: image ? "var(--md-on-surface)" : "var(--md-on-surface-variant)",
                  borderRadius: "var(--md-shape-full)",
                  border: `1.5px solid ${image ? "var(--md-outline)" : "color-mix(in srgb, var(--md-outline) 40%, transparent)"}`,
                  cursor: !image ? "not-allowed" : "pointer",
                  minHeight: 44,
                  opacity: image ? 1 : 0.5,
                  transition: "all var(--md-duration-short) var(--md-easing-standard)",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
                Analyze UI
              </button>

              {/* Browse */}
              <button
                onClick={() => image ? handleRemove() : inputRef.current?.click()}
                className="md-interactive inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium"
                style={{
                  backgroundColor: "var(--md-surface-container)",
                  color: "var(--md-on-surface)",
                  borderRadius: "var(--md-shape-full)",
                  border: "1.5px solid var(--md-outline)",
                  minHeight: 44,
                  cursor: "pointer",
                }}
              >
                {image ? (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Remove
                  </>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v8.25A2.25 2.25 0 0 0 4.5 16.5h15a2.25 2.25 0 0 0 2.25-2.25V9A2.25 2.25 0 0 0 19.5 6.75h-6.69Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Browse
                  </>
                )}
              </button>

              {/* Keyboard shortcut hint */}
              {image && (
                <span
                  className="ml-auto hidden sm:inline-flex items-center gap-1.5 text-xs"
                  style={{ color: "var(--md-on-surface-variant)", opacity: 0.7 }}
                  aria-hidden="true"
                >
                  Average run: 4–7s
                  <span className="flex items-center gap-1 ml-2">
                    <kbd
                      className="px-1.5 py-0.5"
                      style={{
                        border: "1px solid var(--md-outline)",
                        borderRadius: 4,
                        fontFamily: "monospace",
                        fontSize: "11px",
                        color: "var(--md-on-surface-variant)",
                        lineHeight: 1.4,
                      }}
                    >⌘</kbd>
                    <kbd
                      className="px-1.5 py-0.5"
                      style={{
                        border: "1px solid var(--md-outline)",
                        borderRadius: 4,
                        fontFamily: "monospace",
                        fontSize: "11px",
                        color: "var(--md-on-surface-variant)",
                        lineHeight: 1.4,
                      }}
                    >↵</kbd>
                    <span>Analyze</span>
                  </span>
                </span>
              )}
            </motion.div>
          )}

          {/* Results */}
          {analysis && (
            <section aria-labelledby="results-heading" className="mt-12 flex flex-col gap-5">
              <h2 id="results-heading" className="sr-only">Analysis results</h2>

              {/* Model badge */}
              {usedModel && (
                <div className="flex justify-end">
                  <span
                    className="text-xs px-3 py-1 font-medium"
                    style={{
                      backgroundColor: "var(--md-surface-container)",
                      color: "var(--md-on-surface-variant)",
                      borderRadius: "var(--md-shape-full)",
                      border: "1px solid var(--md-outline)",
                      fontFamily: "monospace",
                    }}
                  >
                    Claude {MODELS.find((m) => m.id === usedModel)?.label}
                  </span>
                </div>
              )}

              {/* UI UPDATE */}
              {analysis.ui_update?.length > 0 && (
                <div style={{ backgroundColor: "var(--md-surface-container-high)", borderRadius: "var(--md-shape-xl)", overflow: "hidden" }}>
                  <div className="flex items-center justify-between px-6 py-4">
                    <button
                      onClick={() => setExpanded((p) => ({ ...p, ui: !p.ui }))}
                      className="md-interactive flex items-center gap-3 flex-1 text-left"
                      style={{ background: "none", border: "none", cursor: "pointer", minHeight: 44, borderRadius: "var(--md-shape-md)", padding: "0 8px 0 0" }}
                      aria-expanded={expanded.ui}
                      aria-controls="ui-update-content"
                    >
                      <ListChecks size={18} aria-hidden="true" style={{ color: "var(--md-primary)" }} />
                      <span className="text-sm font-medium" style={{ color: "var(--md-on-surface)" }}>UI Update</span>
                      <span
                        className="text-xs px-2 py-0.5"
                        style={{ backgroundColor: "var(--md-primary-container)", color: "var(--md-on-primary-container)", borderRadius: "var(--md-shape-full)" }}
                      >
                        {analysis.ui_update.length}
                      </span>
                      <ChevronDown
                        size={16}
                        aria-hidden="true"
                        style={{
                          color: "var(--md-on-surface-variant)",
                          transform: expanded.ui ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform var(--md-duration-short) var(--md-easing-standard)",
                          marginLeft: "auto",
                        }}
                      />
                    </button>
                    {expanded.ui && (
                      <button
                        onClick={() => copySection("ui", buildUiUpdateText(analysis.ui_update))}
                        className="md-interactive inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium ml-3"
                        style={{
                          color: copiedSection === "ui" ? "var(--md-primary)" : "var(--md-on-surface-variant)",
                          border: "1px solid var(--md-outline)",
                          borderRadius: "var(--md-shape-md)",
                          backgroundColor: "transparent",
                          minHeight: 36,
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                        aria-label={copiedSection === "ui" ? "Copied!" : "Copy UI Update section"}
                      >
                        {copiedSection === "ui"
                          ? <><Check size={13} aria-hidden="true" /> Copied</>
                          : <><Copy size={13} aria-hidden="true" /> Copy</>}
                      </button>
                    )}
                  </div>
                  {expanded.ui && (
                    <ol
                      id="ui-update-content"
                      className="flex flex-col"
                      aria-label="UI update instructions"
                      style={{ borderTop: "1px solid color-mix(in srgb, var(--md-outline) 30%, transparent)" }}
                    >
                      {analysis.ui_update.map((item, i) => (
                        <li
                          key={i}
                          className="px-6 py-4 text-sm leading-relaxed"
                          style={{
                            color: "var(--md-on-surface)",
                            borderBottom: i < analysis.ui_update.length - 1
                              ? "1px solid color-mix(in srgb, var(--md-outline) 15%, transparent)"
                              : "none",
                          }}
                        >
                          {item}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              )}

              {/* SCREEN READER */}
              {analysis.screen_reader?.length > 0 && (
                <div style={{ backgroundColor: "var(--md-background)", border: "1.5px solid var(--md-outline)", borderRadius: "var(--md-shape-xl)", overflow: "hidden" }}>
                  <div className="flex items-center justify-between px-6 py-4">
                    <button
                      onClick={() => setExpanded((p) => ({ ...p, sr: !p.sr }))}
                      className="md-interactive flex items-center gap-3 flex-1 text-left"
                      style={{ background: "none", border: "none", cursor: "pointer", minHeight: 44, borderRadius: "var(--md-shape-md)", padding: "0 8px 0 0" }}
                      aria-expanded={expanded.sr}
                      aria-controls="sr-content"
                    >
                      <Ear size={18} aria-hidden="true" style={{ color: "var(--md-primary)" }} />
                      <div>
                        <span className="text-sm font-medium" style={{ color: "var(--md-on-surface)" }}>Screen Reader</span>
                        <p className="text-xs mt-0.5" style={{ color: "var(--md-on-surface-variant)" }}>Navigation order + expected announcement</p>
                      </div>
                      <ChevronDown
                        size={16}
                        aria-hidden="true"
                        style={{
                          color: "var(--md-on-surface-variant)",
                          transform: expanded.sr ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform var(--md-duration-short) var(--md-easing-standard)",
                          marginLeft: "auto",
                        }}
                      />
                    </button>
                    {expanded.sr && (
                      <button
                        onClick={() => copySection("sr", buildScreenReaderText(analysis.screen_reader))}
                        className="md-interactive inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium ml-3"
                        style={{
                          color: copiedSection === "sr" ? "var(--md-primary)" : "var(--md-on-surface-variant)",
                          border: "1px solid var(--md-outline)",
                          borderRadius: "var(--md-shape-md)",
                          backgroundColor: "transparent",
                          minHeight: 36,
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                        aria-label={copiedSection === "sr" ? "Copied!" : "Copy Screen Reader section"}
                      >
                        {copiedSection === "sr"
                          ? <><Check size={13} aria-hidden="true" /> Copied</>
                          : <><Copy size={13} aria-hidden="true" /> Copy</>}
                      </button>
                    )}
                  </div>
                  {expanded.sr && (
                    <div
                      id="sr-content"
                      className="flex flex-col"
                      style={{ borderTop: "1px solid color-mix(in srgb, var(--md-outline) 30%, transparent)" }}
                    >
                      {analysis.screen_reader.map((section, si) => (
                        <div
                          key={si}
                          style={{ borderBottom: si < analysis.screen_reader.length - 1 ? "1px solid color-mix(in srgb, var(--md-outline) 15%, transparent)" : "none" }}
                        >
                          <p className="px-6 pt-4 pb-2 text-xs font-medium" style={{ color: "var(--md-primary)" }}>
                            {section.section}
                          </p>
                          {section.items.map((item, ii) => (
                            <div
                              key={ii}
                              className="px-6 py-3 flex flex-col gap-1"
                              style={{ borderTop: ii > 0 ? "1px solid color-mix(in srgb, var(--md-outline) 10%, transparent)" : "none" }}
                            >
                              <div className="flex items-baseline gap-2">
                                <span className="text-xs font-medium shrink-0 tabular-nums" style={{ color: "var(--md-primary)" }}>
                                  {item.index}
                                </span>
                                <span className="text-sm font-medium" style={{ color: "var(--md-on-surface)" }}>
                                  {item.element}
                                </span>
                              </div>
                              <p className="text-xs leading-relaxed ml-5" style={{ color: "var(--md-on-surface-variant)" }}>
                                &ldquo;{item.announcement}&rdquo;
                              </p>
                              {item.states?.map((state, si2) => (
                                <p key={si2} className="text-xs ml-5" style={{ color: "var(--md-on-surface-variant)" }}>{state}</p>
                              ))}
                              {item.live?.map((l, li) => (
                                <p key={li} className="text-xs ml-5" style={{ color: "var(--md-on-surface-variant)" }}>{l}</p>
                              ))}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

        </div>
      </main>
    </div>
  );
}

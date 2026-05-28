"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Upload, Trash2, Copy, Check, ListChecks, Ear, ChevronDown } from "lucide-react";

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

const MODELS: { id: ModelId; label: string; description: string }[] = [
  { id: "claude-sonnet-4-5",          label: "Sonnet", description: "More thorough — recommended" },
  { id: "claude-haiku-4-5-20251001",  label: "Haiku",  description: "Faster, lighter" },
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

  async function handleAnalyze() {
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
  }

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
        className="hidden md:flex flex-col gap-6 px-4 shrink-0"
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
        aria-label="Tool settings"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease }}
      >
        {/* Model selector */}
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs font-medium px-1" style={{ color: "var(--md-on-surface)" }}>
              AI Model
            </p>
            <p className="text-xs mt-1 px-1 leading-relaxed" style={{ color: "var(--md-on-surface-variant)" }}>
              Choose the model for your analysis. Sonnet is more thorough; Haiku is faster and lighter.
            </p>
          </div>
          <div className="flex flex-col gap-2" role="group" aria-label="AI model selection">
            {MODELS.map((m) => {
              const isActive = selectedModel === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => !loading && setSelectedModel(m.id)}
                  className="md-interactive flex flex-col items-start px-3 py-3 text-left w-full"
                  style={{
                    border: isActive ? "1.5px solid var(--md-primary)" : "1.5px solid var(--md-outline)",
                    borderRadius: "var(--md-shape-lg)",
                    backgroundColor: isActive ? "var(--md-primary-container)" : "transparent",
                    minHeight: 44,
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.5 : 1,
                    transition: "all var(--md-duration-short) var(--md-easing-standard)",
                  }}
                  aria-pressed={isActive}
                  disabled={loading}
                >
                  <span
                    className="text-sm font-medium"
                    style={{ color: isActive ? "var(--md-on-primary-container)" : "var(--md-on-surface)" }}
                  >
                    {m.label}
                  </span>
                  <span
                    className="text-xs mt-0.5 leading-relaxed"
                    style={{ color: isActive ? "var(--md-on-primary-container)" : "var(--md-on-surface-variant)" }}
                  >
                    {m.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main id="main-content" className="flex-1 min-w-0" tabIndex={-1}>
        <div className="px-10 pt-24 pb-32 max-w-3xl">

          {/* Page header */}
          <div className="mb-10">
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
              AI Tool
            </motion.span>
            <motion.h1
              className="text-5xl font-light tracking-tight"
              style={{ color: "var(--md-on-background)" }}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease, delay: 0.5 }}
            >
              UX Accessibility Reviewer
            </motion.h1>
            <motion.p
              className="mt-4 text-lg"
              style={{ color: "var(--md-on-surface-variant)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.65 }}
            >
              Upload a screenshot and get AI-powered accessibility feedback from Claude.
            </motion.p>
          </div>

          {/* Upload / Preview / Loading */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.8 }}
          >
          {loading ? (
            <div
              className="flex flex-col gap-2 p-6"
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
                        backgroundColor: isDone ? "var(--md-primary-container)" : isActive ? "var(--md-primary)" : "var(--md-outline)",
                        boxShadow: isActive ? "0 0 0 4px color-mix(in srgb, var(--md-primary) 20%, transparent)" : "none",
                        transition: "all var(--md-duration-short) var(--md-easing-standard)",
                      }}
                    />
                    <span
                      className="text-sm"
                      style={{
                        color: isDone ? "var(--md-on-surface-variant)" : isActive ? "var(--md-on-surface)" : "var(--md-outline)",
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
              className="md-interactive flex flex-col items-center justify-center gap-4 p-14 text-center cursor-pointer"
              style={{
                border: `2px dashed ${dragging ? "var(--md-primary)" : "var(--md-outline)"}`,
                borderRadius: "var(--md-shape-xl)",
                backgroundColor: dragging ? "var(--md-surface-container-high)" : "var(--md-surface-container)",
                transition: "all var(--md-duration-short) var(--md-easing-standard)",
              }}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 16V8M12 8L9 11M12 8L15 11" stroke="var(--md-on-surface-variant)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 16.5V18.75C3 19.9926 4.00736 21 5.25 21H18.75C19.9926 21 21 19.9926 21 18.75V16.5" stroke="var(--md-on-surface-variant)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--md-on-surface)" }}>
                  Drop a screenshot here
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--md-on-surface-variant)" }}>
                  or click to browse — PNG, JPG, WebP
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden" style={{ borderRadius: "var(--md-shape-xl)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="Uploaded screenshot for analysis" className="w-full object-contain max-h-96" />
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

          {/* Buttons */}
          {!loading && (
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAnalyze}
                disabled={!image}
                className="md-interactive inline-flex items-center gap-2 px-6 py-3 text-sm font-medium"
                style={{
                  backgroundColor: image ? "var(--md-primary)" : "var(--md-surface-variant)",
                  color: image ? "var(--md-on-primary)" : "var(--md-on-surface-variant)",
                  borderRadius: "var(--md-shape-full)",
                  cursor: !image ? "not-allowed" : "pointer",
                  border: "none",
                  minHeight: 44,
                  transition: "background-color var(--md-duration-short) var(--md-easing-standard)",
                }}
              >
                <Sparkles size={16} aria-hidden="true" />
                Analyze UI
              </button>
              {image && (
                <button
                  onClick={handleRemove}
                  className="md-interactive inline-flex items-center gap-2 px-6 py-3 text-sm font-medium"
                  style={{
                    backgroundColor: "var(--md-surface-container)",
                    color: "var(--md-on-surface-variant)",
                    borderRadius: "var(--md-shape-full)",
                    border: "1.5px solid var(--md-outline)",
                    minHeight: 44,
                    cursor: "pointer",
                  }}
                >
                  <Trash2 size={16} aria-hidden="true" /> Remove
                </button>
              )}
              {!image && (
                <button
                  onClick={() => inputRef.current?.click()}
                  className="md-interactive inline-flex items-center gap-2 px-6 py-3 text-sm font-medium"
                  style={{
                    backgroundColor: "var(--md-surface-container)",
                    color: "var(--md-on-surface-variant)",
                    borderRadius: "var(--md-shape-full)",
                    border: "1.5px solid var(--md-outline)",
                    minHeight: 44,
                    cursor: "pointer",
                  }}
                >
                  <Upload size={16} aria-hidden="true" /> Browse
                </button>
              )}
            </div>
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
                    }}
                  >
                    Generated with Claude {MODELS.find((m) => m.id === usedModel)?.label}
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
                        {copiedSection === "ui" ? <><Check size={13} aria-hidden="true" /> Copied</> : <><Copy size={13} aria-hidden="true" /> Copy</>}
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
                        {copiedSection === "sr" ? <><Check size={13} aria-hidden="true" /> Copied</> : <><Copy size={13} aria-hidden="true" /> Copy</>}
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

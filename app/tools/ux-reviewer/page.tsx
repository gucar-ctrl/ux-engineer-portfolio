"use client";

import { useRef, useState } from "react";
import { Sparkles, Upload, Trash2 } from "lucide-react";

type Severity = "alta" | "media" | "bassa";

type Issue = {
  severity: Severity;
  title: string;
  description: string;
};

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

const severityConfig: Record<Severity, { label: string; bg: string; color: string }> = {
  alta:  { label: "High",   bg: "#4E0000", color: "#FFDAD6" },
  media: { label: "Medium", bg: "#4E3800", color: "#FFDEA8" },
  bassa: { label: "Low",    bg: "#003823", color: "#9EF2C4" },
};

export default function UXReviewer() {
  const [image, setImage] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<string>("image/png");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
        body: JSON.stringify({ imageBase64: base64, mediaType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error.");
      setAnalysis(data);
      setImage(null); // Remove image after analysis
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

  return (
    <div
      className="flex min-h-screen flex-col px-6 pt-24 pb-16"
      style={{ backgroundColor: "var(--md-background)" }}
    >
      <main id="main-content" className="w-full max-w-3xl mx-auto" tabIndex={-1}>

        {/* Header */}
        <div className="mb-10 text-center">
          <span
            className="mb-4 inline-block px-3 py-1 text-xs font-medium"
            style={{
              backgroundColor: "var(--md-primary-container)",
              color: "var(--md-on-primary-container)",
              borderRadius: "var(--md-shape-full)",
            }}
          >
            AI Tool
          </span>
          <h1
            className="mt-3 text-4xl font-light tracking-tight sm:text-5xl"
            style={{ color: "var(--md-on-background)" }}
          >
            UX Reviewer
          </h1>
          <p className="mt-3 text-lg" style={{ color: "var(--md-on-surface-variant)" }}>
            Upload a screenshot and get AI-powered usability feedback from Claude.
          </p>
        </div>

        {/* Upload area / Preview */}
        {!image ? (
          <div
            role="button"
            tabIndex={0}
            aria-label="Image upload area. Click or drag a file to upload."
            className="md-interactive flex flex-col items-center justify-center gap-4 p-12 text-center cursor-pointer"
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
            <img
              src={image}
              alt="Uploaded screenshot for analysis"
              className="w-full object-contain max-h-96"
            />
          </div>
        )}

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

        {/* Buttons — always visible */}
        <div className="flex justify-center gap-3 mt-4">
          <button
            onClick={handleAnalyze}
            disabled={!image || loading}
            className="md-interactive inline-flex items-center gap-2 px-8 py-3 text-sm font-medium"
            style={{
              backgroundColor: image && !loading ? "var(--md-primary)" : "var(--md-surface-variant)",
              color: image && !loading ? "var(--md-on-primary)" : "var(--md-on-surface-variant)",
              borderRadius: "var(--md-shape-full)",
              cursor: !image || loading ? "not-allowed" : "pointer",
              border: "none",
              minHeight: "44px",
              transition: "background-color var(--md-duration-short) var(--md-easing-standard)",
            }}
            aria-busy={loading}
          >
            <Sparkles size={16} aria-hidden="true" />
            {loading ? "Analyzing…" : "Analyze UI"}
          </button>
          <button
            onClick={image ? handleRemove : () => inputRef.current?.click()}
            disabled={loading}
            className="md-interactive inline-flex items-center gap-2 px-8 py-3 text-sm font-medium"
            style={{
              backgroundColor: "var(--md-surface-container)",
              color: !loading ? "var(--md-on-surface-variant)" : "var(--md-outline)",
              borderRadius: "var(--md-shape-full)",
              border: "1.5px solid var(--md-outline)",
              minHeight: "44px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {image
              ? <><Trash2 size={16} aria-hidden="true" /> Remove</>
              : <><Upload size={16} aria-hidden="true" /> Browse</>
            }
          </button>
        </div>

        {/* Results */}
        {analysis && (
          <section aria-labelledby="results-heading" className="mt-10 flex flex-col gap-8">
            <h2 id="results-heading" className="sr-only">Analysis results</h2>

            {/* UI UPDATE */}
            {analysis.ui_update?.length > 0 && (
              <div className="flex flex-col gap-3">
                <h3
                  className="text-xs font-medium tracking-widest uppercase"
                  style={{ color: "var(--md-on-surface-variant)" }}
                >
                  UI Update
                </h3>
                <ol className="flex flex-col gap-2" aria-label="UI update instructions">
                  {analysis.ui_update.map((item, i) => (
                    <li
                      key={i}
                      className="px-5 py-4 text-sm leading-relaxed"
                      style={{
                        backgroundColor: "var(--md-surface-container)",
                        borderRadius: "var(--md-shape-lg)",
                        color: "var(--md-on-surface)",
                      }}
                    >
                      {item}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* SCREEN READER */}
            {analysis.screen_reader?.length > 0 && (
              <div className="flex flex-col gap-4">
                <div>
                  <h3
                    className="text-xs font-medium tracking-widest uppercase"
                    style={{ color: "var(--md-on-surface-variant)" }}
                  >
                    Screen Reader
                  </h3>
                  <p className="mt-1 text-xs" style={{ color: "var(--md-on-surface-variant)" }}>
                    Navigation order + expected announcement
                  </p>
                </div>

                {analysis.screen_reader.map((section, si) => (
                  <div key={si} className="flex flex-col gap-2">
                    <p
                      className="text-xs font-medium px-1"
                      style={{ color: "var(--md-primary)" }}
                    >
                      {section.section}
                    </p>
                    {section.items.map((item, ii) => (
                      <div
                        key={ii}
                        className="px-5 py-4 flex flex-col gap-1"
                        style={{
                          backgroundColor: "var(--md-surface-container)",
                          borderRadius: "var(--md-shape-lg)",
                        }}
                      >
                        <div className="flex items-baseline gap-2">
                          <span
                            className="text-xs font-medium shrink-0"
                            style={{ color: "var(--md-primary)" }}
                          >
                            {item.index}
                          </span>
                          <span className="text-sm font-medium" style={{ color: "var(--md-on-surface)" }}>
                            {item.element}
                          </span>
                        </div>
                        <p
                          className="text-xs leading-relaxed ml-5"
                          style={{ color: "var(--md-on-surface-variant)" }}
                        >
                          &ldquo;{item.announcement}&rdquo;
                        </p>
                        {item.states?.map((state, si2) => (
                          <p key={si2} className="text-xs ml-5" style={{ color: "var(--md-on-surface-variant)" }}>
                            {state}
                          </p>
                        ))}
                        {item.live?.map((l, li) => (
                          <p key={li} className="text-xs ml-5" style={{ color: "var(--md-on-surface-variant)" }}>
                            {l}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

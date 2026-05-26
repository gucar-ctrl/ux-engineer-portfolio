export default function UXReviewer() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 pt-16"
      style={{ backgroundColor: "var(--md-background)" }}
    >
      <main id="main-content" className="w-full max-w-2xl text-center" tabIndex={-1}>
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
          className="mb-4 text-4xl font-light tracking-tight sm:text-5xl"
          style={{ color: "var(--md-on-background)" }}
        >
          UX Reviewer
        </h1>
        <p className="text-lg" style={{ color: "var(--md-on-surface-variant)" }}>
          Carica uno screenshot di una UI e ricevi un&apos;analisi di usabilità generata da Claude.
        </p>
      </main>
    </div>
  );
}

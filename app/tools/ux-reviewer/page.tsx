export default function UXReviewer() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6">
      <main className="w-full max-w-2xl text-center">
        <span className="mb-4 inline-block rounded-full border border-zinc-700 px-3 py-1 text-xs font-medium text-zinc-400">
          AI Tool
        </span>
        <h1 className="mb-4 text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
          UX Reviewer
        </h1>
        <p className="text-lg text-zinc-400">
          Carica uno screenshot di una UI e ricevi un'analisi di usabilità generata da Claude.
        </p>
      </main>
    </div>
  );
}

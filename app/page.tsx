import Link from "next/link";

const projects = [
  {
    title: "UX Reviewer",
    description: "Strumento AI che analizza screenshot di interfacce e restituisce feedback di usabilità strutturato.",
    type: "AI + UX",
    href: "/tools/ux-reviewer",
  },
  {
    title: "Design System Explorer",
    description: "Libreria di componenti interattiva con varianti, stati e token documentati.",
    type: "Design Systems",
    href: "#",
  },
  {
    title: "Portfolio",
    description: "Questo portfolio — costruito con Next.js, Tailwind e Material Design 3.",
    type: "Motion + Code",
    href: "#",
  },
];

export default function Home() {
  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "var(--md-background)", color: "var(--md-on-background)" }}
    >
      {/* Hero */}
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <main className="flex flex-col items-center gap-4 text-center">
          <h1
            className="text-4xl font-light tracking-tight sm:text-6xl"
            style={{ color: "var(--md-on-background)" }}
          >
            Hello, I&apos;m Gabriele — UX Engineer
          </h1>
          <p
            className="max-w-md text-lg"
            style={{ color: "var(--md-on-surface-variant)" }}
          >
            Building interfaces with design and AI
          </p>
        </main>
      </div>

      {/* Projects */}
      <section className="w-full max-w-5xl self-center px-6 pb-24">
        <h2
          className="mb-8 text-sm font-medium tracking-widest uppercase"
          style={{ color: "var(--md-on-surface-variant)" }}
        >
          Selected Work
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.title}
              href={project.href}
              className="group flex flex-col gap-4 rounded-3xl p-6 transition-colors"
              style={{
                backgroundColor: "var(--md-surface-container)",
                borderRadius: "var(--md-shape-xl)",
              }}
            >
              <span
                className="w-fit rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  backgroundColor: "var(--md-primary-container)",
                  color: "var(--md-on-primary-container)",
                  borderRadius: "var(--md-shape-full)",
                }}
              >
                {project.type}
              </span>
              <h3
                className="text-lg font-medium"
                style={{ color: "var(--md-on-surface)" }}
              >
                {project.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--md-on-surface-variant)" }}
              >
                {project.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

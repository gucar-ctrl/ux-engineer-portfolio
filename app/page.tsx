import Link from "next/link";

const projects = [
  {
    title: "UX Reviewer",
    description: "Strumento AI che analizza screenshot di interfacce e restituisce feedback di usabilità strutturato.",
    type: "AI + UX",
    href: "/tools/ux-reviewer",
    comingSoon: false,
  },
  {
    title: "Design System Explorer",
    description: "Libreria di componenti interattiva con varianti, stati e token documentati.",
    type: "Design Systems",
    href: null,
    comingSoon: true,
  },
  {
    title: "Portfolio",
    description: "Questo portfolio — costruito con Next.js, Tailwind e Material Design 3.",
    type: "Motion + Code",
    href: null,
    comingSoon: true,
  },
];

export default function Home() {
  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "var(--md-background)", color: "var(--md-on-background)" }}
    >
      {/* Hero — pt-16 per non finire sotto la nav fissa */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 pt-16">
        <main id="main-content" className="flex flex-col items-center gap-4 text-center" tabIndex={-1}>
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
      <section
        aria-labelledby="selected-work-heading"
        className="w-full max-w-5xl self-center px-6 pb-24 pt-8"
      >
        <h2
          id="selected-work-heading"
          className="mb-8 text-sm font-medium tracking-widest uppercase"
          style={{ color: "var(--md-on-surface-variant)" }}
        >
          Selected Work
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {projects.map((project) => {
            const card = (
              <div
                className={`flex flex-col gap-4 p-6 h-full ${!project.comingSoon ? "md-interactive" : ""}`}
                style={{
                  backgroundColor: "var(--md-surface-container)",
                  borderRadius: "var(--md-shape-xl)",
                  border: project.comingSoon
                    ? "1.5px dashed var(--md-outline)"
                    : "1.5px solid transparent",
                  cursor: project.comingSoon ? "default" : "pointer",
                }}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="w-fit px-3 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: "var(--md-primary-container)",
                      color: "var(--md-on-primary-container)",
                      borderRadius: "var(--md-shape-full)",
                    }}
                  >
                    {project.type}
                  </span>
                  {project.comingSoon && (
                    <span
                      className="w-fit px-3 py-1 text-xs font-medium"
                      style={{
                        backgroundColor: "#4E3800",
                        color: "#FFDEA8",
                        borderRadius: "var(--md-shape-full)",
                      }}
                    >
                      Coming soon
                    </span>
                  )}
                </div>
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
              </div>
            );

            return project.href ? (
              <Link
                key={project.title}
                href={project.href}
                aria-label={`Apri progetto: ${project.title}`}
                className="flex"
              >
                {card}
              </Link>
            ) : (
              <div key={project.title} aria-label={`${project.title} — prossimamente`} role="article">
                {card}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

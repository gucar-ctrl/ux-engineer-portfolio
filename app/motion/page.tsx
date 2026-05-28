"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useActiveSection } from "@/lib/use-active-section";

// M3 easing curve — matches --md-easing-standard
const ease = [0.2, 0, 0, 1.0] as const;

// Sidebar navigation sections
const sections = [
  { id: "tokens",          label: "Motion Tokens" },
  { id: "entrance",        label: "Entrance" },
  { id: "hover",           label: "Hover" },
  { id: "page-transition", label: "Page Transition" },
  { id: "stagger",         label: "Stagger" },
] as const;

const sectionIds = sections.map((s) => s.id);

const SCROLL_OFFSET = 88;

function SectionAnchor({ id }: { id: string }) {
  return <div id={id} style={{ position: "relative", top: -SCROLL_OFFSET - 16 }} aria-hidden />;
}

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  window.scrollTo({
    top: el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET + 16,
    behavior: "smooth",
  });
}

// ── Token row component ──────────────────────────────────────────
function TokenRow({
  name,
  value,
  cssVar,
}: {
  name: string;
  value: string;
  cssVar: string;
}) {
  return (
    <div
      className="flex items-center justify-between gap-4 px-4 py-3"
      style={{
        backgroundColor: "var(--md-surface-container)",
        borderRadius: "var(--md-shape-md)",
      }}
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium" style={{ color: "var(--md-on-surface)" }}>
          {name}
        </span>
        <span className="text-xs font-mono" style={{ color: "var(--md-on-surface-variant)" }}>
          {cssVar}
        </span>
      </div>
      <span
        className="text-xs font-mono px-3 py-1"
        style={{
          backgroundColor: "var(--md-surface-container-high)",
          color: "var(--md-primary)",
          borderRadius: "var(--md-shape-full)",
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ── Entrance demo ────────────────────────────────────────────────
function EntranceDemo() {
  const [key, setKey] = useState(0);
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>
        Ogni elemento entra con <code className="font-mono">opacity: 0 → 1</code> e un leggero
        spostamento verticale (<code className="font-mono">y: 16 → 0</code>). Usato nell&apos;hero e
        nelle sezioni heading di ogni pagina.
      </p>
      <div
        className="relative overflow-hidden p-6 flex flex-col gap-3"
        style={{
          backgroundColor: "var(--md-surface-container)",
          borderRadius: "var(--md-shape-xl)",
          minHeight: 120,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease }}
            className="flex flex-col gap-2"
          >
            <div
              className="h-4 w-40 rounded"
              style={{ backgroundColor: "var(--md-primary)", opacity: 0.7 }}
            />
            <div
              className="h-3 w-64 rounded"
              style={{ backgroundColor: "var(--md-on-surface-variant)", opacity: 0.3 }}
            />
            <div
              className="h-3 w-48 rounded"
              style={{ backgroundColor: "var(--md-on-surface-variant)", opacity: 0.2 }}
            />
          </motion.div>
        </AnimatePresence>
      </div>
      <button
        onClick={() => setKey((k) => k + 1)}
        className="md-interactive self-start px-4 py-2 text-xs font-medium"
        style={{
          backgroundColor: "var(--md-primary-container)",
          color: "var(--md-on-primary-container)",
          borderRadius: "var(--md-shape-full)",
          border: "none",
          cursor: "pointer",
        }}
      >
        Replay
      </button>
    </div>
  );
}

// ── Hover demo ───────────────────────────────────────────────────
function HoverDemo() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>
        Le card sulla homepage si sollevano di <code className="font-mono">4px</code> al passaggio
        del mouse (<code className="font-mono">whileHover: &#123; y: -4 &#125;</code>). Combina
        Framer Motion con il M3 state layer CSS per l&apos;overlay semitrasparente.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {["AI + UX", "Design Systems", "Motion + Code"].map((label) => (
          <motion.div
            key={label}
            className="md-interactive flex flex-col gap-2 p-4"
            style={{
              backgroundColor: "var(--md-surface-container)",
              borderRadius: "var(--md-shape-xl)",
              cursor: "pointer",
            }}
            whileHover={{ y: -4, transition: { duration: 0.2, ease } }}
          >
            <span
              className="w-fit px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: "var(--md-primary-container)",
                color: "var(--md-on-primary-container)",
                borderRadius: "var(--md-shape-full)",
              }}
            >
              {label}
            </span>
            <div
              className="h-3 w-24 rounded"
              style={{ backgroundColor: "var(--md-on-surface-variant)", opacity: 0.3 }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Page transition demo ─────────────────────────────────────────
function PageTransitionDemo() {
  const [active, setActive] = useState<"A" | "B">("A");
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>
        Navigare tra le pagine attiva un&apos;uscita (<code className="font-mono">opacity → 0, y → -8</code>)
        seguita da un&apos;entrata (<code className="font-mono">opacity → 1, y → 0</code>) con
        durata 200ms. Il componente <code className="font-mono">PageTransition</code> usa{" "}
        <code className="font-mono">AnimatePresence mode=&quot;wait&quot;</code> e{" "}
        <code className="font-mono">usePathname()</code> come chiave.
      </p>
      <div
        className="relative overflow-hidden"
        style={{
          backgroundColor: "var(--md-surface-container)",
          borderRadius: "var(--md-shape-xl)",
          minHeight: 100,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            className="p-6 flex flex-col gap-2"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease }}
          >
            <span className="text-xs font-medium" style={{ color: "var(--md-primary)" }}>
              Pagina {active}
            </span>
            <div
              className="h-3 w-48 rounded"
              style={{ backgroundColor: "var(--md-on-surface-variant)", opacity: 0.3 }}
            />
            <div
              className="h-3 w-32 rounded"
              style={{ backgroundColor: "var(--md-on-surface-variant)", opacity: 0.2 }}
            />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex gap-2">
        {(["A", "B"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setActive(p)}
            className="md-interactive px-4 py-2 text-xs font-medium"
            style={{
              backgroundColor:
                active === p ? "var(--md-primary-container)" : "var(--md-surface-container)",
              color:
                active === p ? "var(--md-on-primary-container)" : "var(--md-on-surface-variant)",
              borderRadius: "var(--md-shape-full)",
              border: "none",
              cursor: "pointer",
            }}
          >
            Pagina {p}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Stagger demo ─────────────────────────────────────────────────
function StaggerDemo() {
  const [key, setKey] = useState(0);
  const items = ["Prima card", "Seconda card", "Terza card"];
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>
        Le card sulla homepage appaiono in sequenza con un ritardo di{" "}
        <code className="font-mono">70ms</code> tra l&apos;una e l&apos;altra. Il delay è calcolato
        come <code className="font-mono">0.18 + i * 0.07</code> secondi, dove{" "}
        <code className="font-mono">i</code> è l&apos;indice dell&apos;elemento.
      </p>
      <AnimatePresence mode="wait">
        <div key={key} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {items.map((label, i) => (
            <motion.div
              key={label}
              className="p-4 flex flex-col gap-2"
              style={{
                backgroundColor: "var(--md-surface-container)",
                borderRadius: "var(--md-shape-xl)",
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease, delay: 0.1 + i * 0.07 }}
            >
              <span className="text-xs font-medium" style={{ color: "var(--md-on-surface)" }}>
                {label}
              </span>
              <div
                className="h-3 w-20 rounded"
                style={{ backgroundColor: "var(--md-on-surface-variant)", opacity: 0.25 }}
              />
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
      <button
        onClick={() => setKey((k) => k + 1)}
        className="md-interactive self-start px-4 py-2 text-xs font-medium"
        style={{
          backgroundColor: "var(--md-primary-container)",
          color: "var(--md-on-primary-container)",
          borderRadius: "var(--md-shape-full)",
          border: "none",
          cursor: "pointer",
        }}
      >
        Replay
      </button>
    </div>
  );
}

// ── Section wrapper ──────────────────────────────────────────────
function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      className="flex flex-col gap-6"
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, ease }}
    >
      <SectionAnchor id={id} />
      <h2
        className="text-sm font-medium tracking-widest uppercase"
        style={{ color: "var(--md-on-surface-variant)" }}
      >
        {title}
      </h2>
      {children}
    </motion.div>
  );
}

// ── Page ─────────────────────────────────────────────────────────
export default function MotionPage() {
  const [activeId, setActiveId] = useActiveSection(sectionIds);

  return (
    <div
      className="flex min-h-screen"
      style={{ backgroundColor: "var(--md-background)", color: "var(--md-on-background)" }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: 210,
          minWidth: 210,
          position: "sticky",
          top: 64,
          height: "calc(100vh - 64px)",
          overflowY: "auto",
          borderRight: "1px solid var(--md-outline-variant)",
          padding: "32px 0",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <span
          className="px-5 pb-3 text-xs font-medium uppercase tracking-widest"
          style={{ color: "var(--md-on-surface-variant)" }}
        >
          Sezioni
        </span>
        {sections.map((s) => {
          const isActive = activeId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => { setActiveId(s.id); scrollTo(s.id); }}
              className="md-interactive text-left px-5 py-2 text-xs"
              style={{
                background: isActive ? "var(--md-primary-container)" : "none",
                border: "none",
                cursor: "pointer",
                color: isActive ? "var(--md-on-primary-container)" : "var(--md-on-surface-variant)",
                fontWeight: isActive ? 500 : 400,
                borderRadius: "var(--md-shape-sm)",
                transition: "background-color var(--md-duration-short) var(--md-easing-standard), color var(--md-duration-short) var(--md-easing-standard)",
              }}
            >
              {s.label}
            </button>
          );
        })}
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <div className="px-10 pt-24 pb-32 max-w-3xl flex flex-col gap-16">
          {/* Hero */}
          <div className="flex flex-col gap-3">
            <motion.h1
              className="text-4xl font-light tracking-tight"
              style={{ color: "var(--md-on-background)" }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease }}
            >
              Motion + Code
            </motion.h1>
            <motion.p
              className="text-sm max-w-xl"
              style={{ color: "var(--md-on-surface-variant)" }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease, delay: 0.08 }}
            >
              Tutte le animazioni di questo portfolio sono costruite con{" "}
              <strong style={{ color: "var(--md-on-surface)" }}>Framer Motion</strong> e seguono i
              token di movimento di{" "}
              <strong style={{ color: "var(--md-on-surface)" }}>Material Design 3</strong>. Questa
              pagina documenta ogni pattern usato, con demo interattive e i valori esatti.
            </motion.p>
          </div>

          {/* Motion Tokens */}
          <Section id="tokens" title="Motion Tokens">
            <p className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>
              I token di durata e easing sono definiti come CSS custom properties in{" "}
              <code className="font-mono">globals.css</code> e replicati come costanti TypeScript
              nei componenti. La curva di easing principale è la{" "}
              <strong style={{ color: "var(--md-on-surface)" }}>M3 Standard</strong>:{" "}
              <code className="font-mono">cubic-bezier(0.2, 0, 0, 1.0)</code>.
            </p>

            <div className="flex flex-col gap-3">
              <p className="text-xs font-medium" style={{ color: "var(--md-on-surface)" }}>
                Durata
              </p>
              <div className="flex flex-col gap-2">
                <TokenRow
                  name="Short"
                  value="200ms"
                  cssVar="--md-duration-short"
                />
                <TokenRow
                  name="Medium"
                  value="300ms"
                  cssVar="--md-duration-medium"
                />
                <TokenRow
                  name="Long"
                  value="500ms"
                  cssVar="--md-duration-long"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-xs font-medium" style={{ color: "var(--md-on-surface)" }}>
                Easing
              </p>
              <div className="flex flex-col gap-2">
                <TokenRow
                  name="Standard (usato ovunque)"
                  value="cubic-bezier(0.2, 0, 0, 1.0)"
                  cssVar="--md-easing-standard"
                />
                <TokenRow
                  name="Decelerate (entrata)"
                  value="cubic-bezier(0.05, 0.7, 0.1, 1.0)"
                  cssVar="--md-easing-decelerate"
                />
                <TokenRow
                  name="Accelerate (uscita)"
                  value="cubic-bezier(0.3, 0, 0.8, 0.15)"
                  cssVar="--md-easing-accelerate"
                />
              </div>
            </div>

            {/* Animated easing visual */}
            <div
              className="p-5 flex flex-col gap-4"
              style={{
                backgroundColor: "var(--md-surface-container)",
                borderRadius: "var(--md-shape-xl)",
              }}
            >
              <p className="text-xs font-medium" style={{ color: "var(--md-on-surface)" }}>
                Standard vs Lineare — confronto visivo
              </p>
              {[
                { label: "M3 Standard", easing: ease, color: "var(--md-primary)" },
                { label: "Linear", easing: "linear" as const, color: "var(--md-on-surface-variant)" },
              ].map(({ label, easing, color }) => (
                <div key={label} className="flex flex-col gap-1">
                  <span className="text-xs" style={{ color: "var(--md-on-surface-variant)" }}>
                    {label}
                  </span>
                  <div
                    className="relative h-2 overflow-hidden"
                    style={{
                      backgroundColor: "var(--md-surface-container-high)",
                      borderRadius: "var(--md-shape-full)",
                    }}
                  >
                    <motion.div
                      className="absolute left-0 top-0 h-full w-4"
                      style={{ backgroundColor: color, borderRadius: "inherit" }}
                      animate={{ x: [0, "calc(100vw - 16px - 40px)"] }}
                      transition={{
                        duration: 1.5,
                        ease: easing,
                        repeat: Infinity,
                        repeatDelay: 0.5,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Entrance */}
          <Section id="entrance" title="Entrance">
            <EntranceDemo />
          </Section>

          {/* Hover */}
          <Section id="hover" title="Hover">
            <HoverDemo />
          </Section>

          {/* Page Transition */}
          <Section id="page-transition" title="Page Transition">
            <PageTransitionDemo />
          </Section>

          {/* Stagger */}
          <Section id="stagger" title="Stagger">
            <StaggerDemo />
          </Section>
        </div>
      </main>
    </div>
  );
}

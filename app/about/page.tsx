"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useActiveSection } from "@/lib/use-active-section";

const ease = [0.2, 0, 0, 1.0] as const;
const SCROLL_OFFSET = 88;

// ── Data ──────────────────────────────────────────────────────────────────────

const timeline = [
  {
    year: "2020 – present",
    role: "UX Product Designer",
    company: "Assist Digital",
    location: "Milan, Italy",
    description:
      "UX across Fintech, Telco, and Utility. Research, WCAG accessibility compliance, design systems, wireframing, and dev handoff within cross-functional teams.",
    brands: ["Snam", "Eni", "TIM", "Edenred", "Mooney", "BTicino"],
  },
  {
    year: "2019 – 2020",
    role: "UX Designer",
    company: "5A Design",
    location: "Rome, Italy",
    description:
      "Information architecture, customer journey mapping, benchmark analyses, and wireframing for communication and sport events clients.",
    brands: ["Conti editore", "Internazionali Tennis BNL"],
  },
  {
    year: "2014 – 2019",
    role: "Technical Manager",
    company: "Meter Srl",
    location: "Milan, Italy",
    description:
      "End-to-end project management — from requirements gathering and concept to development oversight and release across Communication, Travel, Fashion, and Automation.",
    brands: [],
  },
  {
    year: "2014",
    role: "Web Developer",
    company: "EasyCity",
    location: "Cork, Ireland",
    description: "E-commerce development with WordPress and WooCommerce for travel industry clients.",
    brands: [],
  },
  {
    year: "2007 – 2014",
    role: "Web Developer",
    company: "Meter Srl",
    location: "Milan, Italy",
    description:
      "Front-end development in LAMP stack — HTML, CSS, JavaScript. Industries: Utility and Technology.",
    brands: ["Sorgenia", "Siemens"],
  },
];

const skillGroups = [
  {
    label: "Design",
    items: ["Figma", "Design Systems", "WCAG 2.2 AA", "Wireframing", "User Testing", "Prototyping"],
  },
  {
    label: "Strategy",
    items: ["Design Thinking", "Scrum / Agile", "Stakeholder Workshops", "Benchmarking"],
  },
  {
    label: "Engineering",
    items: ["Next.js", "Tailwind CSS", "Framer Motion", "Claude API", "n8n", "Cursor"],
  },
];

const stack = [
  { name: "Next.js 15",      role: "App Router, SSR, routing" },
  { name: "Tailwind CSS v4", role: "Styling + M3 design tokens" },
  { name: "Framer Motion",   role: "All animations on this site" },
  { name: "Anthropic API",   role: "Claude Sonnet / Haiku for AI analysis" },
  { name: "Cursor",          role: "AI code editor used throughout" },
  { name: "Vercel",          role: "Deploy + CI/CD on every push" },
];

const sections = [
  { id: "overview",    label: "Overview" },
  { id: "experience",  label: "Experience" },
  { id: "skills",      label: "Skills" },
  { id: "this-site",   label: "This site" },
] as const;

const sectionIds = sections.map((s) => s.id);

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.h2
      ref={ref}
      className="text-xs font-medium tracking-widest uppercase"
      style={{ color: "var(--md-on-surface-variant)" }}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, ease }}
    >
      {children}
    </motion.h2>
  );
}

function TimelineItem({ item }: { item: (typeof timeline)[0] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div ref={ref} className="relative flex gap-5 pb-10 last:pb-0">
      {/* Dot */}
      <motion.div
        className="shrink-0 mt-1"
        initial={{ scale: 0, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.3, ease, delay: 0.1 }}
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          backgroundColor: "var(--md-primary)",
          marginLeft: -5,
          boxShadow: "0 0 0 3px var(--md-background)",
        }}
      />

      {/* Content */}
      <motion.div
        className="flex flex-col gap-2"
        initial={{ opacity: 0, x: 20 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.45, ease, delay: 0.15 }}
      >
        <span className="text-xs font-medium" style={{ color: "var(--md-primary)" }}>
          {item.year}
        </span>
        <div>
          <p className="text-base font-medium leading-snug" style={{ color: "var(--md-on-surface)" }}>
            {item.role}
          </p>
          <p className="text-sm mt-0.5" style={{ color: "var(--md-on-surface-variant)" }}>
            {item.company} · {item.location}
          </p>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: "var(--md-on-surface-variant)" }}>
          {item.description}
        </p>
        {item.brands.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {item.brands.map((b) => (
              <span
                key={b}
                className="text-xs px-2 py-0.5"
                style={{
                  backgroundColor: "var(--md-surface-container-high)",
                  color: "var(--md-on-surface-variant)",
                  borderRadius: "var(--md-shape-full)",
                }}
              >
                {b}
              </span>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function SkillGroup({ group }: { group: (typeof skillGroups)[0] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div ref={ref} className="flex flex-col gap-3">
      <span className="text-sm font-medium" style={{ color: "var(--md-on-surface)" }}>
        {group.label}
      </span>
      <div className="flex flex-wrap gap-2">
        {group.items.map((item, i) => (
          <motion.span
            key={item}
            className="px-3 py-1 text-xs font-medium"
            style={{
              backgroundColor: "var(--md-surface-container)",
              color: "var(--md-on-surface-variant)",
              borderRadius: "var(--md-shape-full)",
              border: "1px solid var(--md-outline-variant)",
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.3, ease, delay: i * 0.06 }}
          >
            {item}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  const [activeId, setActiveId] = useActiveSection(sectionIds);

  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineInView = useInView(timelineRef, { once: true, margin: "-40px" });

  const overviewRef = useRef<HTMLDivElement>(null);
  const overviewInView = useInView(overviewRef, { once: true, margin: "-60px" });

  const stackRef = useRef<HTMLDivElement>(null);
  const stackInView = useInView(stackRef, { once: true, margin: "-60px" });

  return (
    <div
      className="flex min-h-screen"
      style={{ backgroundColor: "var(--md-background)", color: "var(--md-on-background)" }}
    >
      {/* ── Sidebar ── */}
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
        aria-label="Page navigation"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease }}
      >
        <span
          className="px-3 pb-3 text-xs font-medium uppercase tracking-widest"
          style={{ color: "var(--md-on-surface-variant)" }}
        >
          On this page
        </span>
        {sections.map((s) => {
          const isActive = activeId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => { setActiveId(s.id); scrollTo(s.id); }}
              className="md-interactive text-left px-3 py-2 text-sm"
              style={{
                background: isActive ? "var(--md-primary-container)" : "none",
                border: "none",
                cursor: "pointer",
                color: isActive ? "var(--md-on-primary-container)" : "var(--md-on-surface-variant)",
                borderRadius: "var(--md-shape-md)",
                fontWeight: isActive ? 500 : 400,
                transition: "background-color var(--md-duration-short) var(--md-easing-standard), color var(--md-duration-short) var(--md-easing-standard)",
              }}
            >
              {s.label}
            </button>
          );
        })}
      </motion.aside>

      {/* ── Main ── */}
      <main id="main-content" className="flex-1 min-w-0" tabIndex={-1}>
        <div className="px-10 pt-24 pb-32 max-w-2xl flex flex-col gap-20">

          {/* Header */}
          <div className="flex flex-col gap-4">
            <motion.span
              className="w-fit px-3 py-1 text-xs font-medium"
              style={{
                backgroundColor: "var(--md-primary-container)",
                color: "var(--md-on-primary-container)",
                borderRadius: "var(--md-shape-full)",
              }}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.35 }}
            >
              About
            </motion.span>
            <motion.h1
              className="text-5xl font-light tracking-tight"
              style={{ color: "var(--md-on-background)" }}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease, delay: 0.5 }}
            >
              Gabriele Ucar
            </motion.h1>
            <motion.p
              className="text-lg"
              style={{ color: "var(--md-on-surface-variant)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.65 }}
            >
              UX Product Designer bridging design and engineering — 15+ years across Fintech, Telco, and Utility.
            </motion.p>
          </div>

          {/* Overview */}
          <section aria-labelledby="overview-heading" className="flex flex-col gap-5">
            <SectionAnchor id="overview" />
            <SectionHeading>Overview</SectionHeading>

            <motion.div
              ref={overviewRef}
              className="flex flex-col gap-4"
              style={{ color: "var(--md-on-surface)" }}
              initial={{ opacity: 0, y: 16 }}
              animate={overviewInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease }}
            >
              <p className="text-base leading-relaxed">
                I've spent 15 years at the intersection of design and technology — from front-end development to product management to UX strategy for enterprise-scale systems. I translate complex requirements into interfaces that are accessible, consistent, and useful.
              </p>
              <p className="text-base leading-relaxed">
                Since 2024, I've been actively closing the gap between what I design and what I can build. This portfolio is the result: every project here was designed and shipped by me, using AI as a coding copilot while keeping full ownership of design and architecture decisions.
              </p>
            </motion.div>
          </section>

          {/* Experience timeline */}
          <section aria-labelledby="experience-heading" className="flex flex-col gap-6">
            <SectionAnchor id="experience" />
            <SectionHeading>Experience</SectionHeading>

            {/* Timeline container */}
            <div
              ref={timelineRef}
              className="relative pl-5"
              style={{ borderLeft: "2px solid var(--md-surface-container-high)" }}
            >
              {/* Animated fill line */}
              <motion.div
                style={{
                  position: "absolute",
                  left: -2,
                  top: 0,
                  width: 2,
                  height: "100%",
                  backgroundColor: "var(--md-primary-container)",
                  transformOrigin: "top",
                }}
                initial={{ scaleY: 0 }}
                animate={timelineInView ? { scaleY: 1 } : {}}
                transition={{ duration: 2.5, ease: [0.2, 0, 0, 1.0] }}
              />

              {timeline.map((item) => (
                <TimelineItem key={`${item.company}-${item.year}`} item={item} />
              ))}
            </div>
          </section>

          {/* Skills */}
          <section aria-labelledby="skills-heading" className="flex flex-col gap-6">
            <SectionAnchor id="skills" />
            <SectionHeading>Skills</SectionHeading>
            <div className="flex flex-col gap-6">
              {skillGroups.map((g) => (
                <SkillGroup key={g.label} group={g} />
              ))}
            </div>
          </section>

          {/* This site */}
          <section aria-labelledby="this-site-heading" className="flex flex-col gap-6">
            <SectionAnchor id="this-site" />
            <SectionHeading>This site</SectionHeading>

            <motion.p
              ref={stackRef}
              className="text-sm leading-relaxed"
              style={{ color: "var(--md-on-surface-variant)" }}
              initial={{ opacity: 0, y: 12 }}
              animate={stackInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, ease }}
            >
              Built with the stack I'm learning — every choice has a reason.
            </motion.p>

            <div className="flex flex-col gap-2">
              {stack.map((item, i) => {
                return (
                  <StackRow key={item.name} item={item} index={i} />
                );
              })}
            </div>

            <motion.p
              className="text-sm leading-relaxed"
              style={{ color: "var(--md-on-surface-variant)" }}
              initial={{ opacity: 0 }}
              animate={stackInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4, ease, delay: 0.5 }}
            >
              Source code on{" "}
              <a
                href="https://github.com/gucar-ctrl/ux-engineer-portfolio"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--md-primary)", textDecoration: "underline", textUnderlineOffset: 3 }}
              >
                GitHub
              </a>
              . Deployed on Vercel — updates on every push to main.
            </motion.p>
          </section>

        </div>
      </main>
    </div>
  );
}

// StackRow needs its own useInView — defined outside to avoid hook-in-loop issue
function StackRow({ item, index }: { item: { name: string; role: string }; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });

  return (
    <motion.div
      ref={ref}
      className="flex items-start gap-4 px-4 py-3"
      style={{
        backgroundColor: "var(--md-surface-container)",
        borderRadius: "var(--md-shape-md)",
      }}
      initial={{ opacity: 0, x: -16 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.4, ease, delay: index * 0.06 }}
    >
      <span
        className="text-sm font-medium shrink-0"
        style={{ color: "var(--md-on-surface)", minWidth: 130 }}
      >
        {item.name}
      </span>
      <span className="text-sm leading-relaxed" style={{ color: "var(--md-on-surface-variant)" }}>
        {item.role}
      </span>
    </motion.div>
  );
}

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

// ── Typewriter component ─────────────────────────────────────────────────────
function TypewriterText({ text, startDelay = 0.4 }: { text: string; startDelay?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [cursorVisible, setCursorVisible] = useState(false);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const start = setTimeout(() => {
      setCursorVisible(true);
      setTyping(true);
      let i = 0;
      let nextTimer: ReturnType<typeof setTimeout>;

      function typeNext() {
        if (i >= text.length) {
          setTyping(false);
          return;
        }
        setDisplayed(text.slice(0, i + 1));
        const char = text[i];
        i++;
        // Natural variance: pause at punctuation, faster mid-word
        let delay = 65 + Math.random() * 55;
        if (char === " ") delay += 30;
        if (char === "," || char === "—" || char === ".") delay += 130;
        nextTimer = setTimeout(typeNext, delay);
      }
      typeNext();

      return () => clearTimeout(nextTimer);
    }, startDelay * 1000);

    return () => clearTimeout(start);
  }, [text, startDelay]);

  return (
    <>
      {displayed}
      {cursorVisible && (
        <motion.span
          className="inline-block rounded-sm ml-[3px]"
          style={{
            width: 2,
            height: "0.85em",
            verticalAlign: "middle",
            backgroundColor: "var(--md-primary)",
            display: "inline-block",
          }}
          animate={typing ? { opacity: 1 } : { opacity: [1, 0] }}
          transition={
            typing
              ? { duration: 0 }
              : { duration: 0.55, repeat: Infinity, repeatType: "reverse", ease: "linear" }
          }
        />
      )}
    </>
  );
}

const projects = [
  {
    title: "UX Accessibility Reviewer",
    description: "An AI tool that analyzes UI screenshots and returns structured accessibility feedback.",
    type: "AI + UX",
    href: "/tools/ux-reviewer",
    comingSoon: false,
  },
  {
    title: "Design System Explorer",
    description: "An interactive component library with documented variants, states, and design tokens.",
    type: "Design Systems",
    href: "/design-system",
    comingSoon: false,
  },
  {
    title: "Motion + Code",
    description: "Animations, micro-interactions, and page transitions — built with Framer Motion and M3 motion tokens.",
    type: "Motion + Code",
    href: "/motion",
    comingSoon: false,
  },
];

const ease = [0.2, 0, 0, 1.0] as const;

export default function Home() {
  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: "var(--md-background)", color: "var(--md-on-background)" }}
    >
      <div className="flex flex-1 flex-col items-center justify-center px-6 pt-16">
        <main id="main-content" className="flex flex-col items-center gap-4 text-center" tabIndex={-1}>
          <h1
            className="text-4xl font-light tracking-tight sm:text-6xl"
            style={{ color: "var(--md-on-background)", minHeight: "1.2em" }}
          >
            <TypewriterText text="Hello, I'm Gabriele — UX Technologist" startDelay={0.3} />
          </h1>
          <motion.p
            className="max-w-md text-lg"
            style={{ color: "var(--md-on-surface-variant)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.55 }}
          >
            A live lab for{" "}
            <span style={{ color: "var(--md-primary)", fontWeight: 500 }}>design systems</span>
            {", "}
            <span style={{ color: "var(--md-primary)", fontWeight: 500 }}>interaction design</span>
            {", and "}
            <span style={{ color: "var(--md-primary)", fontWeight: 500 }}>generative AI</span>
            {" — prototyped with "}
            <span style={{ color: "var(--md-on-surface)", fontWeight: 500 }}>React</span>
            {", "}
            <span style={{ color: "var(--md-on-surface)", fontWeight: 500 }}>Framer Motion</span>
            {", and the "}
            <span style={{ color: "var(--md-on-surface)", fontWeight: 500 }}>Claude API</span>
            {"."}
          </motion.p>
        </main>
      </div>

      <section
        aria-labelledby="selected-work-heading"
        className="w-full max-w-5xl self-center px-6 pb-24 pt-8"
      >
<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {projects.map((project, i) => {
            const card = (
              <motion.div
                className={`flex flex-col gap-4 p-6 h-full ${!project.comingSoon ? "md-interactive" : ""}`}
                style={{
                  backgroundColor: "var(--md-surface-container)",
                  borderRadius: "var(--md-shape-xl)",
                  border: project.comingSoon ? "1.5px dashed var(--md-outline)" : "1.5px solid transparent",
                  cursor: project.comingSoon ? "default" : "pointer",
                }}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease, delay: 0.6 + i * 0.12 }}
                whileHover={!project.comingSoon ? { y: -4, transition: { duration: 0.2, ease } } : undefined}
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
                <h3 className="text-lg font-medium" style={{ color: "var(--md-on-surface)" }}>
                  {project.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--md-on-surface-variant)" }}>
                  {project.description}
                </p>
              </motion.div>
            );

            return project.href ? (
              <Link key={project.title} href={project.href} aria-label={`Open project: ${project.title}`} className="flex">
                {card}
              </Link>
            ) : (
              <div key={project.title} aria-label={`${project.title} — coming soon`} role="article">
                {card}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

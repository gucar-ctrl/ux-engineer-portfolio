"use client";

import { useState, useEffect } from "react";

/**
 * Tracks which section is currently visible near the top of the viewport.
 * Sections must have matching HTML id attributes.
 *
 * @param sectionIds  Ordered list of section IDs (top → bottom)
 * @param offsetPx    Pixel threshold from viewport top to trigger activation (default 110)
 */
export function useActiveSection(sectionIds: readonly string[], offsetPx = 110) {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? "");

  useEffect(() => {
    if (sectionIds.length === 0) return;

    function update() {
      // Start with the first section as default (page top)
      let current = sectionIds[0];

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        // If the section anchor has scrolled to within offsetPx of the top, mark it active
        if (el.getBoundingClientRect().top <= offsetPx) {
          current = id;
        }
      }

      setActiveId(current);
    }

    update(); // run immediately on mount
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [sectionIds, offsetPx]);

  return [activeId, setActiveId] as const;
}

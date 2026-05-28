export type NavLink = {
  label: string;
  href: string;
  group: "identity" | "work";
};

// Aggiungi qui ogni nuova pagina — il menu si aggiornerà ovunque automaticamente
export const navLinks: NavLink[] = [
  { label: "Home",                      href: "/",                   group: "identity" },
  { label: "About",                     href: "/about",              group: "identity" },
  { label: "UX Accessibility Reviewer", href: "/tools/ux-reviewer",  group: "work" },
  { label: "Design System",             href: "/design-system",      group: "work" },
  { label: "Motion + Code",             href: "/motion",             group: "work" },
];

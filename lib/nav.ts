export type NavLink = {
  label: string;
  href: string;
};

// Aggiungi qui ogni nuova pagina — il menu si aggiornerà ovunque automaticamente
export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "UX Reviewer", href: "/tools/ux-reviewer" },
];

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Regole di progetto

## Navigazione
Ogni volta che viene creata una nuova pagina (nuovo `page.tsx` in qualsiasi route), aggiorna automaticamente il file `lib/nav.ts` aggiungendo la voce corrispondente nell'array `navLinks` con label e href corretti. La nav si aggiorna automaticamente su tutte le pagine grazie al layout.

## Decisioni di design e comportamento
Prima di apportare qualsiasi modifica che non sia stata esplicitamente specificata (layout, posizione elementi, comportamento componenti, scelte visive), chiedi sempre conferma all'utente. Non interpretare in autonomia — meglio chiedere.

## Accessibilità
Ogni scelta stilistica, interazione e contenuto deve rispettare i principi WCAG 2.2 livello AA. Questo include: contrasto minimo 4.5:1 per testo normale e 3:1 per testo grande, touch target minimi 44×44px, focus visibile su tutti gli elementi interattivi, struttura heading corretta (h1→h2→h3), testo alternativo per immagini, etichette ARIA dove necessario, e skip-to-content link in ogni pagina. Prima di fare commit verificare sempre la conformità AA.

## Micro-interazioni e stati interattivi (Material Design 3)
Ogni elemento interattivo (link, bottone, card cliccabile) deve avere stati visibili seguendo le specifiche M3:
- Hover: state layer con opacità 8% sul colore `on-surface` o `primary`
- Pressed/Active: state layer al 12%
- Focus-visible: state layer al 12% + outline accessibile
- Tutti i cambi di stato devono usare le easing curve e le duration M3 definite nei token CSS (`--md-easing-standard`, `--md-duration-short`)
- Usare la classe CSS `.md-interactive` definita in `globals.css` su tutti gli elementi interattivi

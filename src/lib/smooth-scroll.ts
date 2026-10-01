import type Lenis from "lenis";

// L'istanza di Lenis (scorrimento con inerzia) della pagina, se attiva: chi blocca lo scorrimento (la lightbox) la ferma e
// la riavvia. Con "riduci animazioni" non c'è, e lo scorrimento resta quello normale del browser.
let current: Lenis | null = null;

export const setLenis = (lenis: Lenis | null) => {
  current = lenis;
};

export const getLenis = () => current;

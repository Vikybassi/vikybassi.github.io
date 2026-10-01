import manifest from "@/data/media-manifest.json";

// I percorsi nei testi sono relativi al vecchio sito ("media/x.jpg"): in Next vanno serviti dalla radice.
export function asset(path: string): string {
  return /^(\/|https?:|mailto:)/.test(path) ? path : `/${path}`;
}

// "schema-gestione-ospedaliera.html" -> "/schema-gestione-ospedaliera"
export function pageRoute(path: string): string {
  return asset(path.replace(/\.html$/, ""));
}

export interface MediaSize {
  w: number;
  h: number;
}

/** Dimensioni reali di un'immagine (le scrive scripts/optimize-media.mjs): servono a riservare lo spazio ed evitare salti di pagina. */
export function sizeOf(path: string): MediaSize | undefined {
  return (manifest as Record<string, MediaSize>)[path.replace(/^\//, "")];
}

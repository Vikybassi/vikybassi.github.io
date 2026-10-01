import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sito statico: `npm run build` produce la cartella `out/`, pubblicata su GitHub Pages (vedi .github/workflows/pages.yml).
  output: "export",
  images: { unoptimized: true },
  // Le due lingue hanno layout radice separati: serve una 404 globale.
  experimental: { globalNotFound: true },
};

export default nextConfig;

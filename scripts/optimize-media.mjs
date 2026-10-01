// Ottimizza immagini e video del portfolio partendo dagli ORIGINALI (che non vengono mai modificati).
//
//   node scripts/optimize-media.mjs "<cartella media originale>"
//   es.  node scripts/optimize-media.mjs "$HOME/Desktop/portfolio-site /media"
//
// - immagini: ridimensionate (max 1800 px gli screenshot, 1600 px il resto), JPEG mozjpeg qualità 80, orientamento EXIF applicato
// - video: H.264 a 540 px di larghezza (la cornice del telefono ne mostra ~236, quindi 540 copre anche gli schermi retina), senza audio
// - poster del video (420 px, basta per la cornice da ~236 px anche su schermi retina): primo fotogramma utile, mostrato mentre il video non è ancora caricato
// - scrive src/data/media-manifest.json con le dimensioni reali (serve a riservare lo spazio e non far "saltare" la pagina)
// - lavora solo sui file citati in src/data/translations.json: gli altri (es. immagini non usate) non vengono copiati
// - per le immagini dell'Archivio scrive anche una versione piccola in public/media/thumbs/ (640 px): sul cilindro le
//   carte sono larghe ~220 px, la versione grande serve solo quando si apre l'immagine
import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import ffmpegPath from "ffmpeg-static";
import sharp from "sharp";

const source = process.argv[2];
if (!source) {
  console.error('Uso: node scripts/optimize-media.mjs "<cartella media originale>"');
  process.exit(1);
}

const OUT = path.resolve("public/media");
const translations = JSON.parse(await fs.readFile("src/data/translations.json", "utf8"));

// Tutti i percorsi "media/..." citati nei testi (screenshot, gallerie, video)
const referenced = new Set();
(function collect(node) {
  if (typeof node === "string") {
    if (node.startsWith("media/")) referenced.add(node);
  } else if (node && typeof node === "object") Object.values(node).forEach(collect);
})(translations);

// Le immagini dell'Archivio (galleria curva): anche in versione piccola
const archive = new Set(["it", "en"].flatMap((l) => (translations[l].archive?.items ?? []).map((i) => i.src)));

const kb = (n) => `${Math.round(n / 1024)} KB`;
const manifest = {};
let before = 0;
let after = 0;

// Tolgo da public/media quanto non è citato (l'originale resta comunque nel vecchio sito)
async function pruneUnreferenced(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await pruneUnreferenced(full);
      continue;
    }
    const rel = "media/" + path.relative(OUT, full).split(path.sep).join("/");
    const isPoster = rel.endsWith("-poster.jpg");
    const isThumb = rel.startsWith("media/thumbs/") && archive.has(rel.replace("media/thumbs/", "media/"));
    if (!referenced.has(rel) && !isPoster && !isThumb) {
      await fs.rm(full);
      console.log(`  rimosso (non usato): ${rel}`);
    }
  }
}

for (const rel of [...referenced].sort()) {
  const from = path.join(source, rel.replace(/^media\//, ""));
  const to = path.join(path.resolve("public"), rel);
  await fs.mkdir(path.dirname(to), { recursive: true });
  const original = (await fs.stat(from)).size;
  before += original;

  if (/\.(jpe?g|png)$/i.test(rel)) {
    const max = rel.includes("/screenshots/") ? 1800 : 1600;
    await sharp(from)
      .rotate()
      .resize({ width: max, height: max, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true, progressive: true })
      .toFile(to);
    const meta = await sharp(to).metadata();
    manifest[rel] = { w: meta.width, h: meta.height };
    if (archive.has(rel)) {
      const thumb = path.join(OUT, "thumbs", rel.replace(/^media\//, ""));
      await fs.mkdir(path.dirname(thumb), { recursive: true });
      await sharp(to).resize({ width: 640, height: 640, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 78, mozjpeg: true }).toFile(thumb);
    }
  } else if (/\.mp4$/i.test(rel)) {
    execFileSync(
      ffmpegPath,
      ["-y", "-loglevel", "error", "-i", from, "-an", "-vf", "scale=540:-2", "-c:v", "libx264", "-preset", "slow", "-crf", "27", "-pix_fmt", "yuv420p", "-movflags", "+faststart", to],
      { stdio: "inherit" },
    );
    const poster = to.replace(/\.mp4$/i, "-poster.jpg");
    execFileSync(ffmpegPath, ["-y", "-loglevel", "error", "-ss", "1.5", "-i", from, "-frames:v", "1", "-vf", "scale=420:-2", "-q:v", "8", poster], {
      stdio: "inherit",
    });
    const meta = await sharp(poster).metadata();
    manifest[rel.replace(/\.mp4$/i, "-poster.jpg")] = { w: meta.width, h: meta.height };
  }
  const optimized = (await fs.stat(to)).size;
  after += optimized;
  console.log(`${rel.padEnd(44)} ${kb(original).padStart(8)} -> ${kb(optimized).padStart(8)}`);
}

await pruneUnreferenced(OUT);

const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
await fs.writeFile("src/data/media-manifest.json", JSON.stringify(sorted, null, 2) + "\n");
console.log(`\nTotale: ${kb(before)} -> ${kb(after)}  (${Math.round((1 - after / before) * 100)}% in meno)`);

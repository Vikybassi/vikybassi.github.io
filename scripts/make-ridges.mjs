// Il rilievo del Monte Disgrazia per lo sfondo della home (linee di cresta), dal modello del terreno Copernicus GLO-30.
//
//   node scripts/make-ridges.mjs "<tessera Copernicus N46 E009 .tif>"
//   es.  node scripts/make-ridges.mjs ~/Desktop/rientro-prima-del-buio/data-cache/dem/Copernicus_DSM_COG_10_N46_00_E009_00_DEM.tif
//
// La tessera (≈40 MB) è la stessa scaricata per "Rientro prima del buio" (scripts/download-dem.sh in quel progetto).
// Scrive src/data/ridges/disgrazia.json: una griglia di quote (un punto ogni ~120 m) già "normalizzate" tra 0 (fondovalle)
// e 1 (vetta) e salvate come un byte per punto in base64: ~64 KB, meno di 50 KB compressi.
import fs from "node:fs/promises";
import { fromFile } from "geotiff";

const tif = process.argv[2];
if (!tif) {
  console.error('Uso: node scripts/make-ridges.mjs "<tessera Copernicus N46 E009 .tif>"');
  process.exit(1);
}

// Val Masino a ovest, Valmalenco a est, la cima (46.2683 N, 9.7512 E: il punto più alto del modello) quasi al centro
const PEAK = { id: "disgrazia", name: "Monte Disgrazia", ele: 3678, area: { south: 46.19, north: 46.35, west: 9.56, east: 9.93 } };
const STEP = 4; // 4 pixel da 30 m

const image = await (await fromFile(tif)).getImage();
const [minX, , , maxY] = image.getBoundingBox();
const [px, py] = image.getResolution();
const x0 = Math.round((PEAK.area.west - minX) / px);
const x1 = Math.round((PEAK.area.east - minX) / px);
const y0 = Math.round((maxY - PEAK.area.north) / -py);
const y1 = Math.round((maxY - PEAK.area.south) / -py);
const [raster] = await image.readRasters({ window: [x0, y0, x1, y1] });
const w = x1 - x0;
const cols = Math.floor(w / STEP);
const rows = Math.floor((y1 - y0) / STEP);

const grid = new Float32Array(cols * rows);
for (let r = 0; r < rows; r++)
  for (let c = 0; c < cols; c++) {
    let s = 0;
    for (let dy = 0; dy < STEP; dy++) for (let dx = 0; dx < STEP; dx++) s += raster[(r * STEP + dy) * w + c * STEP + dx];
    grid[r * cols + c] = s / (STEP * STEP);
  }

// 0 = fondovalle (5° percentile, così il fondo delle valli non schiaccia tutto il resto), 1 = punto più alto
const sorted = Float32Array.from(grid).sort();
const lo = sorted[Math.floor(sorted.length * 0.05)];
const hi = sorted[sorted.length - 1];
const bytes = Uint8Array.from(grid, (v) => Math.round(255 * Math.max(0, Math.min(1, (v - lo) / (hi - lo)))));

await fs.mkdir("src/data/ridges", { recursive: true });
const out = {
  source: "Copernicus GLO-30 DEM, © DLR e Airbus (programma Copernicus); griglia calcolata da scripts/make-ridges.mjs",
  name: PEAK.name,
  ele: PEAK.ele,
  cols,
  rows,
  low: Math.round(lo),
  high: Math.round(hi),
  data: Buffer.from(bytes).toString("base64"),
};
const file = `src/data/ridges/${PEAK.id}.json`;
await fs.writeFile(file, JSON.stringify(out));
console.log(`${PEAK.name}: ${cols}×${rows} punti, quote ${out.low}–${out.high} m, ${Math.round((await fs.stat(file)).size / 1024)} KB`);

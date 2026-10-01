// Prepara la foto "a parte" della hero.
//   node scripts/optimize-photos.mjs
// Sorgenti in assets-source/ (originali, NON pubblicati). Uscita in public/photos/.
// Stanno fuori da public/media perché optimize-media.mjs cancella da lì ciò che non è citato in translations.json.
// sharp toglie i metadati (posizione GPS compresa): nelle copie pubblicate non ce n'è.
import sharp from "sharp";
import fs from "node:fs/promises";

const OUT = "public/photos";
await fs.mkdir(OUT, { recursive: true });

const PHOTOS = [
  { src: "assets-source/hero-vetta.jpg", name: "vetta", widths: [800, 1100, 1500] },
];

for (const { src, name, widths } of PHOTOS) {
  for (const w of widths) {
    const info = await sharp(src)
      .rotate()
      .resize({ width: w })
      .jpeg({ quality: 74, progressive: true, mozjpeg: true })
      .toFile(`${OUT}/${name}-${w}.jpg`);
    console.log(`${name}-${w}.jpg`, info.width, "x", info.height, Math.round(info.size / 1024), "KiB");
  }
}

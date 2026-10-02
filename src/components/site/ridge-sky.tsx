"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/** Forma di src/data/ridges/disgrazia.json (generato da scripts/make-ridges.mjs). */
interface Ridges {
  cols: number;
  rows: number;
  /** quote normalizzate 0 (fondovalle) … 255 (vetta), un byte per punto, in base64 */
  data: string;
}

type RGBA = [number, number, number, number];

/**
 * Il cielo del crepuscolo lungo la pagina: 0 = in cima, 1 = in fondo. `top` = colore in alto, `hor` = all'orizzonte
 * (dietro le creste), `sun` = colore del sole. È l'unica eccezione al "solo bordeaux" di DESIGN.md: racconta la luce.
 */
const SKY: { p: number; top: RGBA; hor: RGBA; sun: [number, number, number] }[] = [
  { p: 0, top: [255, 255, 255, 0], hor: [255, 236, 200, 0.1], sun: [245, 190, 90] }, // giorno
  { p: 0.22, top: [255, 222, 170, 0.13], hor: [255, 184, 110, 0.3], sun: [244, 164, 72] }, // ora d'oro
  { p: 0.42, top: [250, 170, 140, 0.2], hor: [238, 104, 74, 0.4], sun: [232, 98, 60] }, // tramonto
  { p: 0.6, top: [170, 120, 180, 0.26], hor: [226, 110, 142, 0.38], sun: [190, 45, 70] }, // crepuscolo rosa
  { p: 0.8, top: [62, 74, 138, 0.38], hor: [124, 110, 176, 0.32], sun: [150, 30, 60] }, // ora blu
  { p: 1, top: [16, 22, 46, 0.55], hor: [38, 46, 92, 0.38], sun: [120, 20, 50] }, // notte
];

const smooth = (t: number) => t * t * (3 - 2 * t);
const lerpArr = <T extends number[]>(a: T, b: T, t: number) => a.map((v, i) => v + (b[i] - v) * t) as T;

function skyAt(p: number) {
  let i = 0;
  while (i < SKY.length - 2 && p > SKY[i + 1].p) i++;
  const a = SKY[i];
  const b = SKY[i + 1];
  const t = smooth(Math.max(0, Math.min(1, (p - a.p) / (b.p - a.p))));
  return { top: lerpArr(a.top, b.top, t), hor: lerpArr(a.hor, b.hor, t), sun: lerpArr(a.sun, b.sun, t) };
}

const rgba = ([r, g, b, a]: RGBA, k = 1, max = 1) => `rgba(${r | 0},${g | 0},${b | 0},${Math.min(max, a * k).toFixed(3)})`;
const hexToRgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.replace("#", ""), 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
};
const mix = (a: [number, number, number], b: number[], t: number) =>
  `rgb(${(a[0] + (b[0] - a[0]) * t) | 0},${(a[1] + (b[1] - a[1]) * t) | 0},${(a[2] + (b[2] - a[2]) * t) | 0})`;

/**
 * Lo sfondo del sito (tutte le pagine, in SiteShell): il Monte Disgrazia disegnato a linee di cresta (profili sovrapposti, dai dati veri del terreno)
 * e, mentre scorri, il sole che tramonta dietro la montagna, con i colori del crepuscolo fino alla notte.
 *
 * - Una tela fissa dietro alla pagina; i dati (~40 KB compressi) si scaricano dopo il primo disegno.
 * - Scorrendo, le creste vicine si muovono più di quelle lontane (parallasse, come i monti visti dal treno) e il sole scende;
 *   tutto segue lo scroll con un po' di inerzia. Il mouse sposta appena il punto di vista e accende la cresta sotto il cursore.
 * - Le creste lontane prendono il colore del cielo all'orizzonte (la foschia della sera).
 * - Con "riduci animazioni": niente inerzia né deriva, ma il cielo segue comunque la posizione nella pagina.
 * - Il cielo ha un tetto di intensità (CAP): anche nelle fasi più cariche il testo piccolo grigio sopra resta sopra 4,5:1.
 * - Decorativa: aria-hidden; la didascalia della hero in home dice che cos'è.
 * - Nell'Archivio il cielo sta fermo al tramonto (STILL): lì già girano le immagini, e due movimenti insieme stancano.
 */
/** Pagine dove lo sfondo resta fermo, e la fase del cielo che mostrano (0 = giorno … 1 = notte). */
const STILL: Record<string, number> = { "/archive": 0.5, "/en/archive": 0.5 };

export function RidgeSky() {
  const ref = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();
  const still = useRef<number | null>(null);
  useEffect(() => {
    still.current = STILL[pathname.replace(/\/+$/, "") || "/"] ?? null;
  }, [pathname]);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let grid: Float32Array | null = null;
    let t0 = 0;
    let cols = 0;
    let rows = 0;
    let alive = true;
    import("@/data/ridges/disgrazia.json").then((m) => {
      if (!alive) return;
      const d = m.default as Ridges;
      cols = d.cols;
      rows = d.rows;
      const raw = Uint8Array.from(atob(d.data), (ch) => ch.charCodeAt(0));
      // Profili appena ammorbiditi (media pesata 1-2-3-2-1 lungo ogni riga): il modello del terreno a 120 m ha spigoli
      // di rumore che, disegnati come creste, sembrano seghettature
      const soft = new Float32Array(raw.length);
      const wts = [1, 2, 3, 2, 1];
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          let sum = 0;
          let wsum = 0;
          for (let k = -2; k <= 2; k++) {
            const cc = c + k;
            if (cc < 0 || cc >= cols) continue;
            sum += raw[r * cols + cc] * wts[k + 2];
            wsum += wts[k + 2];
          }
          soft[r * cols + c] = sum / wsum / 255;
        }
      grid = soft;
      t0 = performance.now();
    });

    // Colori del tema letti una volta e riletti solo quando cambia il tema (classe .dark su <html>)
    let paper: [number, number, number] = [243, 243, 240];
    let ink: [number, number, number] = [20, 24, 22];
    let accent = "#8e1b31";
    let dark = false;
    const readTheme = () => {
      const cs = getComputedStyle(document.documentElement);
      paper = hexToRgb(cs.getPropertyValue("--paper").trim() || "#f3f3f0");
      ink = hexToRgb(cs.getPropertyValue("--ink").trim() || "#141816");
      accent = cs.getPropertyValue("--accent").trim() || accent;
      dark = document.documentElement.classList.contains("dark");
    };
    readTheme();
    const themeWatch = new MutationObserver(readTheme);
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    let W = 0;
    let H = 0;
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const mouse = { x: 0, y: 0, inside: false };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.inside = true;
    };
    const leave = () => (mouse.inside = false);
    window.addEventListener("pointermove", move);
    document.documentElement.addEventListener("pointerleave", leave);

    const scrollP = () => window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const stars = Array.from({ length: 90 }, () => [Math.random(), Math.random() * 0.4, Math.random() * 1.2 + 0.4, Math.random() * 6]);
    let view = 0;
    let sp = scrollP();
    let raf = 0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!grid) return;
      const narrow = W < 768;
      const grow = reduce ? 1 : Math.min(1, (now - t0) / 1600);
      const ease = 1 - Math.pow(1 - grow, 3);
      const fixed = still.current;
      view += ((mouse.inside && fixed === null ? mouse.x / W - 0.5 : 0) - view) * 0.05;
      sp += ((fixed ?? scrollP()) - sp) * (reduce ? 1 : 0.07);

      ctx.clearRect(0, 0, W, H);
      const top = H * (narrow ? 0.42 : 0.34);
      const N = narrow ? 30 : 44;
      const gap = (H - top) / N;
      const amp = H * (narrow ? 0.24 : 0.26) * ease; // sul telefono appena più bassa: la montagna ha meno spazio in larghezza
      const sky = skyAt(sp);
      // Intensità dei colori: piena nel tema scuro (testo chiaro, contrasto garantito), attenuata nel chiaro, dove un cielo
      // troppo carico sotto il testo scuro lo renderebbe difficile da leggere.
      const k = dark ? 1.25 : 0.72;
      // tetto: nel chiaro un cielo più coprente del 28% scurisce troppo il fondo sotto il testo grigio (notte, tramonto);
      // nello scuro oltre il 35% i colori caldi schiariscono troppo il fondo sotto il testo chiaro
      const cap = dark ? 0.35 : 0.28;

      // cielo: la sfumatura arriva fino in fondo alla tela (niente bordo netto dove finisce)
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, rgba(sky.top, k, cap));
      g.addColorStop(Math.min(1, (top + H * 0.12) / H), rgba(sky.hor, k, cap));
      g.addColorStop(1, rgba(sky.hor, k, cap));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // stelle: si accendono col buio e tremolano appena
      const night = Math.max(0, (sp - 0.74) / 0.26);
      if (night > 0) {
        ctx.fillStyle = "#fff";
        for (const [x, y, r, ph] of stars) {
          ctx.globalAlpha = night * (0.35 + (reduce ? 0.2 : 0.35 * Math.sin(now * 0.002 + ph)));
          ctx.beginPath();
          ctx.arc(x * W, y * H, r, 0, 7);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      // sole: scende col crescere della pagina e diventa rosso; alone morbido
      const sx = W * (narrow ? 0.78 : 0.8);
      const sy = H * 0.2 + sp * H * 0.42;
      const sr = Math.min(W, H) * 0.034;
      const halo = ctx.createRadialGradient(sx, sy, sr * 0.5, sx, sy, sr * 4);
      halo.addColorStop(0, rgba([...sky.sun, 0.35] as RGBA));
      halo.addColorStop(1, rgba([...sky.sun, 0] as RGBA));
      ctx.fillStyle = halo;
      ctx.fillRect(sx - sr * 4, sy - sr * 4, sr * 8, sr * 8);
      ctx.fillStyle = rgba([...sky.sun, 0.95] as RGBA);
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, 7);
      ctx.fill();

      // creste, dalla più lontana alla più vicina: ognuna copre quelle dietro (e il sole, quando tramonta)
      // da ferma la montagna non scorre: si mostra com'è alla posizione della fase scelta, senza deriva né cresta accesa
      const drift = reduce || fixed !== null ? 0 : now * 0.000004;
      const near = mouse.inside && fixed === null ? Math.round((mouse.y - top) / gap) : -1;
      const per = 2 * (cols - 1);
      const step = 4;
      // quanta montagna entra in larghezza: tutta su schermi larghi, meno su quelli stretti (altrimenti sul telefono
      // centinaia di punti si comprimono in pochi pixel e le creste diventano un seghetto)
      const span = cols * 0.9 * Math.min(1, Math.max(0.32, W / 1300));
      // inquadratura centrata sul massiccio (la vetta è a metà della griglia): sul telefono, che ne mostra solo un pezzo,
      // altrimenti si vedrebbe il fondovalle della Val Masino, piatto
      const center = cols * 0.52 - span / 2;
      // quota in un punto qualunque (anche tra due colonne), con la montagna "a specchio" ai bordi
      const at = (row: number, pos: number) => {
        let m = pos % per;
        if (m < 0) m += per;
        const c0 = Math.floor(m);
        const t = m - c0;
        const mirror = (c: number) => (c < cols ? c : per - c);
        const a = grid![row * cols + mirror(c0)];
        const b = grid![row * cols + mirror((c0 + 1) % per)];
        return a + (b - a) * t;
      };
      for (let i = 0; i < N; i++) {
        const r = Math.min(rows - 1, Math.floor((i * rows) / N));
        const base = top + i * gap;
        const depth = i / N;
        const persp = 0.55 + 0.45 * depth;
        const shift = (view * 0.5 + (sp * 1.1 + drift) * (0.35 + 0.65 * depth)) * span;
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let x = 0; x <= W + step; x += step) {
          const u = (x / W - 0.5) / persp + 0.5;
          // posizione continua (non arrotondata): mentre scorri le creste scivolano senza scatti
          ctx.lineTo(x, base - at(r, center + u * span + shift) * amp * persp);
        }
        ctx.lineTo(W, H);
        ctx.closePath();
        // foschia: al massimo un terzo del colore del cielo (nel chiaro meno), così il testo sopra resta leggibile
        ctx.fillStyle = mix(paper, sky.hor, Math.min(dark ? 0.35 : 0.26, sky.hor[3] * 1.6 * k) * Math.pow(1 - depth, 1.6));
        ctx.fill();
        const hot = i === near;
        ctx.lineWidth = hot ? 1.8 : 1;
        ctx.strokeStyle = hot ? accent : mix(ink, sky.hor, 0.35 * (1 - depth));
        ctx.globalAlpha = hot ? 0.9 : 0.12 + 0.22 * depth;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      themeWatch.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />;
}

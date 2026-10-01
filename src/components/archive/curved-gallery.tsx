"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { useLightbox } from "@/components/site/lightbox";
import { asset } from "@/lib/asset";
import { useLang } from "@/lib/i18n";

type Item = { src: string; title: string; note: string; pos?: string };

/** Velocità con cui il cilindro gira da solo (radianti per fotogramma, ~12° al secondo). */
const CRUISE = 0.0035;
/** Parte centrale dello schermo in cui il cursore non accelera: il cilindro continua alla sua velocità. */
const DEAD_ZONE = 0.3;
/** Velocità in più col cursore sul bordo. */
const BOOST = 0.013;
/** Sopra un'immagine il cilindro rallenta (a questa frazione), così si clicca comodamente. */
const HOVER_SLOW = 0.35;

/** Sul cilindro basta la versione piccola (scripts/optimize-media.mjs la scrive in media/thumbs/). */
const thumb = (src: string) => (src.startsWith("media/") ? src.replace("media/", "media/thumbs/") : src.replace("-1100.", "-800."));

function sizes(width: number) {
  const narrow = width < 768;
  const w = narrow ? 200 : 300;
  return { w, h: Math.round(w * 1.4), r: narrow ? 640 : Math.min(1350, Math.max(950, width * 0.88)), gap: narrow ? 14 : 24 };
}

/**
 * Galleria curva (ispirata a kargo-studio.com): le immagini stanno sulla parete interna di un cilindro e noi al centro,
 * così quelle ai lati si piegano verso di noi. Il cilindro gira sempre, piano; col cursore verso il bordo destro o
 * sinistro accelera da quella parte (e ci resta), sopra un'immagine rallenta. Col dito si trascina; ci sono anche le
 * frecce. Clic: l'immagine si apre grande.
 *
 * Per riempire il giro le immagini si ripetono: solo il primo giro è raggiungibile con la tastiera (le copie sono nascoste
 * ai lettori di schermo). Con "riduci animazioni" il cilindro sta fermo e non segue il cursore (restano trascinamento
 * e frecce), senza inerzia.
 * Niente caricamento pigro né decodifica asincrona, e niente ritagli (overflow) intorno alle immagini: dentro un
 * cilindro 3D che si muove Chrome altrimenti lascia alcune carte vuote.
 */
export function CurvedGallery({ items }: { items: Item[] }) {
  const { t } = useLang();
  const { open } = useLightbox();
  const reduce = useReducedMotion();
  const track = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  // dove sta il cursore, da -1 (bordo sinistro) a 1 (bordo destro); null se è fuori dalla galleria o non c'è un mouse
  const pointer = useRef<number | null>(null);
  const speed = useRef(0);
  const dir = useRef(1); // verso in cui gira da solo: l'ultimo scelto col cursore
  const over = useRef(false); // il cursore è sopra un'immagine
  const [dims, setDims] = useState(() => sizes(1280));
  const step = (dims.w + dims.gap) / dims.r;
  const count = Math.max(items.length, Math.floor((2 * Math.PI) / step));
  const angleStep = (2 * Math.PI) / count; // il giro si chiude senza buchi

  // angolo voluto (cursore, trascinamento, frecce; in radianti) e angolo mostrato (lo insegue)
  const offset = useRef(0);
  const shown = useRef(0);
  const moved = useRef(0);

  useEffect(() => {
    const onResize = () => setDims(sizes(window.innerWidth));
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const el = ring.current;
      if (!el) return;
      // gira sempre; il cursore fuori dalla zona centrale accelera (sempre di più verso il bordo) e sceglie il verso
      const p = reduce ? null : pointer.current;
      const push = p === null || Math.abs(p) < DEAD_ZONE ? 0 : Math.sign(p) * ((Math.abs(p) - DEAD_ZONE) / (1 - DEAD_ZONE)) ** 2;
      if (push) dir.current = Math.sign(push);
      const goal = reduce ? 0 : (push ? dir.current * CRUISE + push * BOOST : dir.current * CRUISE) * (over.current ? HOVER_SLOW : 1);
      speed.current += (goal - speed.current) * 0.06;
      offset.current += speed.current;
      const wanted = offset.current;
      shown.current = reduce ? wanted : shown.current + (wanted - shown.current) * 0.12;
      const cards = el.children;
      for (let i = 0; i < cards.length; i++) {
        const a = i * angleStep - shown.current;
        (cards[i] as HTMLElement).style.transform =
          `translateZ(${dims.r - 150}px) rotateY(${(-a * 180) / Math.PI}deg) translateZ(${-dims.r}px)`;
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [angleStep, dims.r, reduce]);

  // trascinamento: un pixel sposta il cilindro di un pixel sulla sua parete
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let x0: number | null = null;
    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      x0 = e.clientX;
      moved.current = 0;
    };
    const hover = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const box = el.getBoundingClientRect();
      pointer.current = ((e.clientX - box.left) / box.width) * 2 - 1;
    };
    const leave = () => (pointer.current = null);
    const move = (e: PointerEvent) => {
      if (x0 === null) return;
      const dx = e.clientX - x0;
      x0 = e.clientX;
      moved.current += Math.abs(dx);
      offset.current -= dx / dims.r;
    };
    const up = () => (x0 = null);
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", hover);
    el.addEventListener("pointerleave", leave);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", hover);
      el.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [dims.r]);

  const nudge = (n: number) => (offset.current += n * angleStep);
  // con la tastiera: l'immagine che prende il focus viene portata al centro
  const focusCard = (i: number) => {
    let target = i * angleStep;
    const turn = 2 * Math.PI;
    target -= Math.round((target - offset.current) / turn) * turn;
    offset.current = target;
  };

  return (
    <div ref={track} className="relative">
      <div className="relative h-[100svh] min-h-[560px] overflow-hidden">
        <div className="absolute inset-0 touch-pan-y select-none [perspective:1100px]">
          <div ref={ring} className="absolute left-1/2 top-[50%] [transform-style:preserve-3d]">
            {Array.from({ length: count }, (_, i) => {
              const item = items[i % items.length];
              const first = i < items.length;
              return (
                <button
                  key={i}
                  type="button"
                  tabIndex={first ? 0 : -1}
                  aria-hidden={first ? undefined : true}
                  aria-label={`${item.title}, ${item.note}`}
                  onFocus={first ? () => focusCard(i) : undefined}
                  onPointerEnter={() => (over.current = true)}
                  onPointerLeave={() => (over.current = false)}
                  onClick={() => moved.current < 6 && open(asset(item.src), `${item.title}, ${item.note}`)}
                  className="group absolute block cursor-zoom-in text-left [backface-visibility:hidden] focus-visible:outline-none"
                  style={{ width: dims.w, left: -dims.w / 2, top: -dims.h / 2 - 16 }}
                >
                  <img
                    src={asset(thumb(item.src))}
                    alt=""
                    draggable={false}
                    className="block w-full rounded-[3px] object-cover shadow-[0_24px_50px_-24px_rgba(0,0,0,0.55)] ring-accent transition-[filter] duration-300 group-hover:brightness-110 group-focus-visible:ring-2"
                    style={{ height: dims.h, objectPosition: item.pos }}
                  />
                  <span className="mt-2.5 flex justify-between gap-2 text-[12.5px]">
                    <span className="font-medium text-ink">{item.title}</span>
                    <span className="text-ink-soft">{item.note}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => nudge(-1)}
            aria-label={t.archive.prev}
            className="grid size-11 place-items-center rounded-full border border-line bg-paper/80 text-ink backdrop-blur transition-colors hover:border-ink"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => nudge(1)}
            aria-label={t.archive.next}
            className="grid size-11 place-items-center rounded-full border border-line bg-paper/80 text-ink backdrop-blur transition-colors hover:border-ink"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}

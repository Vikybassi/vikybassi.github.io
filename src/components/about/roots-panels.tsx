"use client";

/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ParallaxColumns } from "@/components/ui/parallax-scroll";
import { useLightbox } from "@/components/site/lightbox";
import { Reveal } from "@/components/site/reveal";
import { SectionTitle, Wrap } from "@/components/site/primitives";
import { asset, sizeOf } from "@/lib/asset";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { Translations } from "@/data/types";

type RootCard = Translations["about"]["rootsCards"][number];

// `pos` sceglie quale parte tenere nel ritaglio delle foto usate a tutta immagine (una sola foto in galleria).
const SINGLE_PHOTO_POS: Record<string, string> = {
  "media/sport/sport-3.jpg": "50% 64%",
  "media/sport/sport-1.jpg": "50% 40%",
};

/** Radice con una sola foto (Montagna): pannello a tutta immagine, testo sopra, la foto scorre piano nella cornice. */
function FullBleedPanel({ card }: { card: RootCard }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : -45, reduce ? 0 : 45]);
  const src = card.gallery[0];

  return (
    <div className="relative isolate min-h-[460px] overflow-hidden rounded-md bg-night md:min-h-[600px]" ref={ref}>
      <motion.img
        src={asset(src)}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        style={{ y, scale: 1.18, objectPosition: SINGLE_PHOTO_POS[src] ?? "50% 50%" }}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-night/95 via-night/50 to-night/5" />
      <div className="relative flex h-full min-h-[460px] flex-col justify-end p-7 text-fog md:min-h-[600px] md:p-10">
        <p className="text-[14px] font-medium text-fog/90">{card.eyebrow}</p>
        <h3 className="mt-2 font-display text-[44px] font-bold leading-none tracking-[-0.04em] md:text-[64px]">{card.title}</h3>
        <p className="mt-5 max-w-md text-[15.5px] leading-relaxed text-fog/85">{card.text}</p>
      </div>
    </div>
  );
}

function PhotoTile({ src, label, className }: { src: string; label: string; className?: string }) {
  const { open } = useLightbox();
  const size = sizeOf(src);
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => open(asset(src), label)}
      className={cn("group block w-full cursor-zoom-in overflow-hidden bg-paper", className)}
    >
      <img
        src={asset(src)}
        alt={label}
        width={size?.w}
        height={size?.h}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
      />
    </button>
  );
}

/** Radice con più foto (Movimento, Pittura): il racconto per esteso, poi un muro di foto a velocità diverse (Parallax Scroll di Aceternity). */
function GalleryRoot({ card }: { card: RootCard }) {
  const { u } = useLang();
  const label = (n: number) => u.imageOf(card.title, n + 1, card.gallery.length);
  const ratios = ["aspect-[3/4]", "aspect-[4/5]", "aspect-[2/3]"];
  const offsets = ["", "md:mt-16", "md:mt-6"];

  return (
    <Wrap className="mt-24 md:mt-32">
      <Reveal>
        <h3 className="font-display text-[44px] font-bold leading-[0.95] tracking-[-0.04em] md:text-[64px]">{card.title}</h3>
        <p className="mt-5 max-w-xl text-[16.5px] leading-relaxed text-ink-soft">{card.text}</p>
      </Reveal>
      <ParallaxColumns
        className="mt-10"
        columns={card.gallery.map((src, n) => (
          <div key={src} className={offsets[n % 3]}>
            <PhotoTile src={src} label={label(n)} className={ratios[n % 3]} />
          </div>
        ))}
      />
    </Wrap>
  );
}

/**
 * Radice Musica: il quadro sulla musica e la playlist. Il player di Spotify è un iframe di terzi (cookie, tracciamento):
 * si carica solo quando si preme il pulsante; prima c'è una scheda nostra, senza richieste a Spotify.
 */
function MusicRoot({ card }: { card: RootCard }) {
  const { u } = useLang();
  const [on, setOn] = useState(false);
  const pl = card.playlist!;
  const url = `https://open.spotify.com/playlist/${pl.id}`;

  return (
    <Wrap className="mt-24 scroll-mt-28 md:mt-32">
      <div id="musica" className="grid scroll-mt-28 items-center gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-14">
        <Reveal>
          <PhotoTile src={card.gallery[0]} label={`${card.title}: ${card.eyebrow}`} className="aspect-[4/5] rounded-md" />
        </Reveal>
        <Reveal>
          <h3 className="font-display text-[44px] font-bold leading-[0.95] tracking-[-0.04em] md:text-[64px]">{card.title}</h3>
          <p className="mt-5 max-w-xl text-[16.5px] leading-relaxed text-ink-soft">{card.text}</p>

          <div className="mt-8 overflow-hidden rounded-md border border-line bg-raised">
            {on ? (
              <iframe
                title={pl.frameTitle}
                src={`https://open.spotify.com/embed/playlist/${pl.id}?theme=0`}
                width="100%"
                height="352"
                loading="lazy"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                className="block border-0"
              />
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-5 p-6">
                <div>
                  <p className="font-display text-[26px] font-bold leading-tight tracking-[-0.02em]">{pl.name}</p>
                  <p className="mt-1 text-[14px] text-ink-soft">{pl.tracks}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOn(true)}
                  className="inline-flex items-center gap-2 rounded-md bg-bordeaux px-5 py-3 text-[15px] font-medium text-white transition-[background-color,transform] duration-200 hover:bg-bordeaux-soft active:translate-y-px"
                >
                  <span aria-hidden="true">▶</span> {pl.listen}
                </button>
              </div>
            )}
          </div>
          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink-soft">
            <span>{pl.privacy}</span>
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-ink underline decoration-ink/25 underline-offset-4 hover:text-accent">
              {pl.open} <span aria-hidden="true">↗</span>
              <span className="sr-only"> {u.newTab}</span>
            </a>
          </p>
        </Reveal>
      </div>
    </Wrap>
  );
}

/** Le radici: da dove vengo e cosa mi muove fuori dallo schermo. Una foto sola → pannello a tutta immagine;
 *  più foto → racconto e muro di foto (stesso trattamento che avevano gli hobby in Progetti, ora unificato qui).
 *  Quante radici e quali foto le decide src/data/translations.json (about.rootsCards). */
export function RootsPanels() {
  const { t } = useLang();
  const a = t.about;

  return (
    <>
      <Wrap className="mt-24 md:mt-32">
        <Reveal>
          <SectionTitle>{a.rootsTitle}</SectionTitle>
        </Reveal>
      </Wrap>

      {a.rootsCards.map((card) =>
        card.playlist ? (
          <MusicRoot key={card.title} card={card} />
        ) : card.gallery.length > 1 ? (
          <GalleryRoot key={card.title} card={card} />
        ) : (
          <Wrap key={card.title} className="mt-10">
            <Reveal>
              <FullBleedPanel card={card} />
            </Reveal>
          </Wrap>
        ),
      )}
    </>
  );
}

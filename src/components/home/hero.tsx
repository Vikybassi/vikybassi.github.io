"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Btn, Wrap } from "@/components/site/primitives";
import { useLang } from "@/lib/i18n";

// Foto della hero: generata da scripts/optimize-photos.mjs a partire da assets-source/hero-vetta.jpg.
// Per cambiarla: sostituisci quel file, rilancia lo script e aggiorna la descrizione (heroPhotoAlt in src/data/ui.ts).
const PHOTO = { w: 1500, h: 2000, widths: [800, 1100, 1500] };

/**
 * La hero: "Portfolio", nome, cosa faccio, un'azione; la foto in vetta in una cornice verticale a destra. Dietro, fisso per
 * tutto il sito, il Monte Disgrazia a linee di cresta con il tramonto (RidgeSky, in SiteShell). Tutto nella prima schermata.
 */
export function Hero() {
  const { t, u, href } = useLang();
  const h = t.home;
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  // La foto scorre un po' più piano della pagina mentre si esce dalla hero
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "10%"]);

  return (
    <section ref={ref} className="relative isolate overflow-hidden">
      <Wrap className="relative grid min-h-[100dvh] content-center gap-12 pb-20 pt-28 md:grid-cols-12 md:items-center md:gap-8 md:pb-16 md:pt-24">
        <div className="md:col-span-7">
          <p className="mb-5 text-[16px] font-medium text-accent">{h.kicker}</p>
          <h1 className="font-display text-[clamp(56px,9vw,128px)] font-extrabold leading-[0.86] tracking-[-0.045em]">
            {h.headline.split(" ").map((word) => (
              <span key={word} className="block">
                {word}
              </span>
            ))}
          </h1>
          <p className="mt-8 max-w-[31ch] text-[19px] leading-snug text-ink-soft md:text-[21px]">{h.subhead}</p>
          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-2">
            <Btn href={href("/projects")}>{h.ctaPrimary}</Btn>
            <Btn href={href("/about")} variant="link">
              {h.ctaSecondary}
            </Btn>
          </div>
        </div>

        <figure className="md:col-span-5 md:col-start-8">
          <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-line">
            <motion.img
              src="/photos/vetta-1100.jpg"
              srcSet={PHOTO.widths.map((w) => `/photos/vetta-${w}.jpg ${w}w`).join(", ")}
              sizes="(min-width: 768px) 38vw, 100vw"
              alt={u.heroPhotoAlt}
              width={PHOTO.w}
              height={PHOTO.h}
              fetchPriority="high"
              decoding="async"
              style={{ y, scale: 1.12, objectPosition: "50% 62%" }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </figure>
      </Wrap>
    </section>
  );
}

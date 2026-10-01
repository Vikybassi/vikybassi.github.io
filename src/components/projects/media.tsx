"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { useLightbox } from "@/components/site/lightbox";
import { asset, sizeOf } from "@/lib/asset";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Carosello di screenshot dentro una cornice da browser. Click sull'immagine = zoom; frecce da tastiera. */
export function ScreenshotCarousel({ images, title, className }: { images: string[]; title: string; className?: string }) {
  const [idx, setIdx] = useState(0);
  const { open } = useLightbox();
  const { u } = useLang();
  const go = (i: number) => setIdx((i + images.length) % images.length);
  // Riserva lo spazio dello screenshot più alto: nessun taglio e nessun salto di pagina mentre le immagini si caricano
  const sizes = images.map((src) => sizeOf(src));
  const ratio = sizes.every(Boolean) ? Math.min(...sizes.map((s) => s!.w / s!.h)) : undefined;

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label={title}
      className={cn(
        "overflow-hidden rounded-md border border-line bg-raised shadow-[0_30px_60px_-40px_color-mix(in_oklab,var(--ink)_45%,transparent)]",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 border-b border-line px-4 py-2.5" aria-hidden="true">
        <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
      </div>
      <div
        className="relative"
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") go(idx - 1);
          if (e.key === "ArrowRight") go(idx + 1);
        }}
      >
        <div className={ratio ? "relative" : "grid"} style={ratio ? { aspectRatio: ratio } : undefined}>
          {images.map((src, i) => {
            const size = sizeOf(src);
            return (
              <img
                key={src}
                src={asset(src)}
                alt={u.screenshotAlt(title, i + 1, images.length)}
                width={size?.w}
                height={size?.h}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                aria-hidden={i !== idx}
                onClick={() => open(asset(src), u.imageOf(title, i + 1, images.length))}
                className={cn(
                  "h-auto w-full cursor-zoom-in transition-opacity duration-300 motion-reduce:transition-none",
                  ratio ? "absolute inset-0 h-full object-contain" : "col-start-1 row-start-1",
                  i === idx ? "opacity-100" : "pointer-events-none opacity-0",
                )}
              />
            );
          })}
        </div>
        <button
          type="button"
          aria-label={u.prevImage}
          onClick={() => go(idx - 1)}
          className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md bg-night/65 text-xl text-white backdrop-blur transition-colors hover:bg-bordeaux"
        >
          <span aria-hidden="true">&#8249;</span>
        </button>
        <button
          type="button"
          aria-label={u.nextImage}
          onClick={() => go(idx + 1)}
          className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md bg-night/65 text-xl text-white backdrop-blur transition-colors hover:bg-bordeaux"
        >
          <span aria-hidden="true">&#8250;</span>
        </button>
        {/* Ogni puntino è un pulsante di almeno 24×24 px (WCAG 2.2, dimensione minima del bersaglio); il disegno resta piccolo */}
        <div className="absolute inset-x-0 bottom-1 flex justify-center">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={u.goToImage(i + 1)}
              aria-current={i === idx}
              onClick={() => setIdx(i)}
              className="group flex h-6 min-w-6 items-center justify-center px-0.5"
            >
              <span
                className={cn(
                  "block h-2 rounded-full transition-all",
                  i === idx ? "w-5 bg-accent" : "w-2 bg-ink/35 group-hover:bg-ink/60",
                )}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Video in cornice da telefono (demo app Android). Si carica solo quando sta per entrare nello schermo e si ferma
 * quando esce; se l'utente riduce le animazioni non parte da solo e mostra i comandi.
 */
export function PhoneVideo({ src, className }: { src: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const near = useInView(ref, { once: true, margin: "300px" });
  const visible = useInView(ref, { amount: 0.3 });
  const reduce = useReducedMotion();
  // Il poster (primo fotogramma) è generato da scripts/optimize-media.mjs accanto al video
  const posterPath = src.replace(/\.mp4$/i, "-poster.jpg");
  const poster = sizeOf(posterPath);

  useEffect(() => {
    const v = ref.current;
    if (!v || !near || reduce) return;
    if (visible) void v.play().catch(() => {});
    else v.pause();
  }, [near, visible, reduce]);

  return (
    <div
      className={cn(
        "mx-auto w-[250px] overflow-hidden rounded-[2rem] border-[7px] border-night bg-night shadow-[0_40px_60px_-30px_rgba(15,10,16,0.7)]",
        className,
      )}
    >
      <div className="mx-auto mb-1 h-4 w-24 rounded-b-xl bg-night" aria-hidden="true" />
      <video
        ref={ref}
        className="w-full rounded-[1.2rem] bg-night"
        style={{ aspectRatio: poster ? poster.w / poster.h : 9 / 19.5 }}
        poster={poster ? asset(posterPath) : undefined}
        src={near ? asset(src) : undefined}
        preload="none"
        loop
        muted
        playsInline
        controls={!!reduce}
      />
    </div>
  );
}

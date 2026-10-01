"use client";

import "./journey.css";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { getLenis } from "@/lib/smooth-scroll";

/**
 * La home: il viaggio 3D (scene.ts) con sopra i testi in HTML, che restano nitidi e leggibili dai lettori di schermo.
 * La scena (e three.js con lei) si scarica dopo il primo disegno della pagina; senza WebGL resta la versione semplice:
 * titolo, frase e i link finali.
 */
export function Journey() {
  const { t, u, lang, href } = useLang();
  const j = t.journey;
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const intro = useRef<HTMLDivElement>(null);
  const end = useRef<HTMLElement>(null);
  const pbar = useRef<HTMLElement>(null);
  const pnum = useRef<HTMLSpanElement>(null);
  const plabel = useRef<HTMLSpanElement>(null);
  const caps = useRef<(HTMLDivElement | null)[]>([]);
  const [noGl, setNoGl] = useState(false);

  useEffect(() => {
    let dispose: (() => void) | undefined;
    let cancelled = false;
    import("./scene").then(async (mod) => {
      if (cancelled) return;
      if (!mod.hasWebGL()) {
        setNoGl(true);
        return;
      }
      const d = await mod.createJourney(
        {
          root: root.current!,
          stage: stage.current!,
          captions: caps.current.filter((c): c is HTMLDivElement => !!c),
          intro: intro.current!,
          end: end.current!,
          pbar: pbar.current!,
          pnum: pnum.current!,
          plabel: plabel.current!,
        },
        {
          stopNames: j.stops.map((s) => s.title),
          code: j.code,
          progress: { start: j.progressStart, drag: j.progressDrag },
        },
      );
      if (cancelled) d();
      else dispose = d;
    });
    return () => {
      cancelled = true;
      dispose?.();
    };
    // la scena si ricrea solo cambiando lingua (i testi sullo schermo e sul vinile sono disegnati nella scena)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const go = () => {
    const top = (root.current?.offsetTop ?? 0) + innerHeight * 0.9;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(top, { duration: 2.2 });
    else scrollTo({ top, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  return (
    <section ref={root} className={`jy${noGl ? " jy-nogl" : ""}`} aria-label={j.lead}>
      <div ref={stage} className="jy-stage">
        <div ref={intro} className="jy-intro">
          <div>
            <h1>
              <span>{j.kicker}</span>
              Vittoria Bassi
            </h1>
            <p className="jy-lead">{j.lead}</p>
            {!noGl && (
              <button type="button" className="jy-btn" onClick={go}>
                {j.start}
              </button>
            )}
          </div>
        </div>

        <div className="jy-cap" aria-live="polite">
          {j.stops.map((s, i) => (
            <div key={s.n} ref={(el) => void (caps.current[i] = el)} className="jy-off">
              <p className="jy-n">{s.n}</p>
              <h2>
                <em>{s.title}</em>
              </h2>
              <p>{s.text}</p>
              {s.link && (
                <a href={s.link.href} target="_blank" rel="noopener noreferrer">
                  {s.link.label} <span aria-hidden="true">↗</span>
                  <span className="sr-only"> {u.newTab}</span>
                </a>
              )}
            </div>
          ))}
          <div ref={(el) => void (caps.current[j.stops.length] = el)} className="jy-off">
            <p className="jy-n">{j.end.n}</p>
            <h2>
              {j.end.light} <em>{j.end.bold}</em>
            </h2>
            <p>{j.end.text}</p>
          </div>
        </div>

        <nav ref={end} className="jy-end" aria-label={j.end.text}>
          {j.endLinks.map((l) => (
            <Link key={l.href} href={href(l.href)}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="jy-progress">
          <span ref={plabel}>{j.progressStart}</span>
          <i aria-hidden="true">
            <b ref={pbar} />
          </i>
          <span ref={pnum} aria-hidden="true">
            00 / 06
          </span>
        </div>
      </div>
    </section>
  );
}

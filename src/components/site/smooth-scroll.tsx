"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { setLenis } from "@/lib/smooth-scroll";

/**
 * Scorrimento con un po' di inerzia (Lenis): la rotella non va più a scatti e lo sfondo della home (sole, creste) si muove
 * in modo continuo. Scorre la finestra vera, quindi le animazioni legate allo scroll (Motion) continuano a funzionare.
 * Spento con "riduci animazioni".
 */
export function SmoothScroll() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, anchors: { offset: -96 } });
    setLenis(lenis);
    let id = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      id = requestAnimationFrame(raf);
    };
    id = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
      setLenis(null);
    };
  }, []);
  return null;
}

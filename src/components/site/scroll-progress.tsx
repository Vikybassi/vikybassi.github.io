"use client";

import { motion, useScroll, useSpring } from "motion/react";

// Eredita il "trail rail" del vecchio sito: una linea bordeaux che segna quanto sentiero hai percorso.
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[70] h-[3px] origin-left bg-accent"
    />
  );
}

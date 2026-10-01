"use client";

import { useRef, useSyncExternalStore, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { cn } from "@/lib/utils";

// Vero dal breakpoint "md" in su. Sul server è falso: la versione stretta (colonne in fila, ferme) è quella di partenza.
function subscribe(cb: () => void) {
  const mq = window.matchMedia("(min-width: 768px)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const useWide = () =>
  useSyncExternalStore(
    subscribe,
    () => window.matchMedia("(min-width: 768px)").matches,
    () => false,
  );

const COLS: Record<number, string> = { 1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4" };

/**
 * Adattamento di "Parallax Scroll" di Aceternity UI: colonne di immagini che scorrono a velocità (e versi) diversi.
 * Differenze dall'originale: le colonne sono contenuto libero (ReactNode) invece di sole immagini, il parallasse segue lo
 * scroll della pagina (non un contenitore a parte), su schermo stretto le colonne si dispongono in fila e restano ferme
 * (altrimenti si sovrapporrebbero) e con "riduci animazioni" non c'è movimento.
 * `speeds`: spostamento in px di ogni colonna, da inizio a fine dello scroll.
 */
export function ParallaxColumns({
  columns,
  speeds = [-70, 70, -35],
  className,
}: {
  columns: ReactNode[];
  speeds?: number[];
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const wide = useWide();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  return (
    <div ref={ref} className={cn("grid grid-cols-1 items-start gap-4 md:gap-6", COLS[columns.length] ?? "md:grid-cols-3", className)}>
      {columns.map((col, i) => (
        <Column key={i} progress={scrollYProgress} speed={reduce || !wide ? 0 : (speeds[i] ?? 0)}>
          {col}
        </Column>
      ))}
    </div>
  );
}

function Column({ progress, speed, children }: { progress: MotionValue<number>; speed: number; children: ReactNode }) {
  const y = useTransform(progress, [0, 1], [-speed, speed]);
  return (
    <motion.div style={{ y }} className="flex flex-col gap-4 md:gap-6">
      {children}
    </motion.div>
  );
}

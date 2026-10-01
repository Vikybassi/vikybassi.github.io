"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Adattamento di "Container Scroll Animation" di Aceternity UI: una finestra in prospettiva che si "apre" e si raddrizza
 * mentre scorri. Differenze dall'originale: cornice sottile sul fondo della pagina (invece del tablet grigio a misura fissa), altezza legata al contenuto, intestazione fuori dall'animazione, una seconda finestra
 * opzionale (`aside`) che sporge dal bordo e scorre a velocità diversa, nessun movimento con "riduci animazioni".
 */
export function ContainerScroll({
  header,
  children,
  aside,
  className,
}: {
  header: ReactNode;
  children: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rotate = useTransform(scrollYProgress, [0.08, 0.42], [reduce ? 0 : 24, 0]);
  const scale = useTransform(scrollYProgress, [0.08, 0.42], [reduce ? 1 : 0.9, 1]);
  const lift = useTransform(scrollYProgress, [0.08, 0.6], [reduce ? 0 : 60, reduce ? 0 : -24]);
  const asideLift = useTransform(scrollYProgress, [0.1, 0.7], [reduce ? 0 : 110, reduce ? 0 : 10]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      {header}
      <div className="relative mx-auto mt-12 max-w-[920px] px-5 sm:px-8 md:mt-16" style={{ perspective: "1400px" }}>
        <motion.div
          style={{ rotateX: rotate, scale, y: lift, transformOrigin: "50% 0%" }}
          className="overflow-hidden rounded-md border border-line bg-raised shadow-[0_60px_120px_-60px_color-mix(in_oklab,var(--ink)_55%,transparent)]"
        >
          {children}
        </motion.div>
        {aside && (
          <motion.div
            style={{ y: asideLift }}
            className="pointer-events-none absolute -bottom-32 -right-2 z-10 hidden w-[46%] rotate-[1.5deg] md:block lg:-right-28"
          >
            {aside}
          </motion.div>
        )}
      </div>
    </div>
  );
}

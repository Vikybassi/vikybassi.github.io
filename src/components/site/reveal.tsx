"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Comparsa allo scroll (come .reveal del vecchio sito), con ritardo opzionale per le liste.
 * `immediate`: per il contenuto già visibile all'apertura della pagina. Parte visibile nell'HTML statico, senza attendere
 * JavaScript: altrimenti su un telefono lento il primo testo resterebbe invisibile finché non termina il caricamento.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  immediate = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  immediate?: boolean;
}) {
  if (immediate) return <div className={className}>{children}</div>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.6, ease: [0.2, 0.7, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

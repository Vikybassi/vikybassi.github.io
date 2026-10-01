"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface StickyItem {
  id: string;
  /** Testo che scorre a sinistra. */
  text: ReactNode;
  /** Visuale che resta ferma a destra e cambia con il testo attivo. */
  visual: ReactNode;
}

/**
 * Adattamento di "Sticky Scroll Reveal" di Aceternity UI: il testo scorre, la visuale resta ferma e cambia con la voce attiva.
 * Differenze dall'originale: scorre con la pagina (non in un contenitore a parte), niente sfondi a gradiente fissi, la voce
 * attiva si riconosce con un IntersectionObserver e, sotto lo schermo largo, ogni visuale segue il proprio testo.
 */
export function StickyScrollReveal({ items, className }: { items: StickyItem[]; className?: string }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        });
      },
      { rootMargin: "-42% 0px -42% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [items.length]);

  return (
    <div className={cn("relative lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:gap-16", className)}>
      <div>
        {items.map((item, i) => (
          <article
            key={item.id}
            data-index={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            className="flex min-h-[72vh] flex-col justify-center py-14 last:min-h-[40vh] lg:py-20"
          >
            <div
              className={cn(
                "transition-opacity duration-500 motion-reduce:transition-none",
                i === active ? "lg:opacity-100" : "lg:opacity-35",
              )}
            >
              {item.text}
            </div>
            <div className="mt-8 lg:hidden">{item.visual}</div>
          </article>
        ))}
      </div>

      <div className="relative hidden lg:block">
        <div className="sticky top-24 flex h-[calc(100vh-8rem)] max-h-[720px] items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={items[active].id}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: [0.2, 0.7, 0.3, 1] }}
              className="w-full"
            >
              {items[active].visual}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLang } from "@/lib/i18n";
import { getLenis } from "@/lib/smooth-scroll";

interface LightboxContextValue {
  open: (src: string, alt?: string) => void;
}

const LightboxContext = createContext<LightboxContextValue | null>(null);

export function useLightbox() {
  const ctx = useContext(LightboxContext);
  if (!ctx) throw new Error("useLightbox deve stare dentro <LightboxProvider>");
  return ctx;
}

/** Zoom in-page delle immagini: click fuori o Esc per chiudere; il focus va sul pulsante Chiudi e poi torna dov'era. */
export function LightboxProvider({ children }: { children: ReactNode }) {
  const { u } = useLang();
  const [image, setImage] = useState<{ src: string; alt: string } | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const open = useCallback((src: string, alt = "") => setImage({ src, alt }), []);
  const close = useCallback(() => setImage(null), []);
  const value = useMemo(() => ({ open }), [open]);

  useEffect(() => {
    if (!image) return;
    lastFocus.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      // Unico elemento focalizzabile: Tab resta sul pulsante Chiudi
      if (e.key === "Tab") {
        e.preventDefault();
        closeRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    getLenis()?.stop(); // con lo scorrimento a inerzia attivo, anche lui deve fermarsi
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      getLenis()?.start();
      lastFocus.current?.focus();
    };
  }, [image, close]);

  return (
    <LightboxContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {image && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-night/90 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label={image.alt || u.enlarged}
          >
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label={u.close}
              className="absolute right-5 top-4 text-4xl leading-none text-fog/80 hover:text-white"
            >
              &times;
            </button>
            <motion.img
              src={image.src}
              alt={image.alt}
              className="max-h-[88vh] max-w-[92vw] rounded-lg object-contain shadow-2xl"
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </LightboxContext.Provider>
  );
}

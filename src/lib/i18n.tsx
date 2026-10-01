"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import translations from "@/data/translations.json";
import { ui } from "@/data/ui";
import type { Lang, Translations } from "@/data/types";

// Stessa chiave del vecchio portfolio: chi aveva scelto EN continua a vedere EN.
const STORAGE_KEY = "vb-lang";

/** Percorso equivalente nell'altra lingua: "/about" <-> "/en/about", "/" <-> "/en". */
export function switchPath(pathname: string, target: Lang): string {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (target === "en") return path === "/" ? "/en" : `/en${path}`;
  return path === "/en" ? "/" : path.replace(/^\/en(?=\/)/, "");
}

interface LangContextValue {
  lang: Lang;
  t: Translations;
  u: (typeof ui)[Lang];
  /** Passa all'altra lingua (naviga alla pagina equivalente e ricorda la scelta). */
  setLang: (lang: Lang) => void;
  /** Percorso interno nella lingua corrente: href("/projects") -> "/en/projects" in inglese. */
  href: (path: string) => string;
}

const LangContext = createContext<LangContextValue | null>(null);

/** La lingua è decisa dalla rotta (/ = italiano, /en = inglese): l'HTML statico è già nella lingua giusta. */
export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const setLang = useCallback(
    (next: Lang) => {
      if (next === lang) return;
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* storage non disponibile: la scelta non viene ricordata */
      }
      router.push(switchPath(pathname, next));
    },
    [lang, pathname, router],
  );

  // Chi aveva scelto l'inglese (anche sul vecchio sito) e apre una pagina italiana viene portato alla versione inglese.
  useEffect(() => {
    if (lang !== "it") return;
    try {
      if (localStorage.getItem(STORAGE_KEY) === "en") router.replace(switchPath(pathname, "en"));
    } catch {
      /* storage non disponibile */
    }
  }, [lang, pathname, router]);

  const value = useMemo<LangContextValue>(
    () => ({
      lang,
      t: translations[lang] as unknown as Translations,
      u: ui[lang],
      setLang,
      href: (path: string) => (lang === "en" ? (path === "/" ? "/en" : `/en${path}`) : path),
    }),
    [lang, setLang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang deve stare dentro <LangProvider>");
  return ctx;
}

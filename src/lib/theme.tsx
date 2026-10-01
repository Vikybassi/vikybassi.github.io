"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { THEME_STORAGE_KEY } from "@/lib/theme-script";

export type Theme = "light" | "dark";

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

function apply(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

// Scelta salvata; altrimenti il tema del sistema operativo.
function preferredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* storage non disponibile */
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// Come useLayoutEffect nel browser (prima del disegno), senza avvisi durante la generazione statica.
const useBrowserLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const getSnapshot = (): Theme => (document.documentElement.classList.contains("dark") ? "dark" : "light");
const getServerSnapshot = (): Theme => "light";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Lo script nell'<head> applica il tema prima del primo disegno, ma React, idratando, può ripulire gli attributi di <html>
  // che non gestisce lui (classe `dark`, colorScheme): qui li riapplichiamo prima che il browser ridisegni.
  useBrowserLayoutEffect(() => {
    apply(preferredTheme());
    notify();
  }, []);

  const toggle = useCallback(() => {
    const next: Theme = getSnapshot() === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* storage non disponibile: il tema vale solo per questa visita */
    }
    apply(next);
    notify();
  }, []);

  // Finché non scegli a mano, il tema segue quello del sistema operativo.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      try {
        if (localStorage.getItem(THEME_STORAGE_KEY)) return;
      } catch {
        /* ignora */
      }
      apply(mq.matches ? "dark" : "light");
      notify();
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const value = useMemo(() => ({ theme, toggle }), [theme, toggle]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme deve stare dentro <ThemeProvider>");
  return ctx;
}

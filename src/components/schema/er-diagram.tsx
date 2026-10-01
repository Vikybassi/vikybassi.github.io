"use client";

import { useEffect, useRef, useState } from "react";
import { ER_DIAGRAM } from "@/data/er-diagram";
import { useLang } from "@/lib/i18n";
import { useTheme, type Theme } from "@/lib/theme";

const MERMAID_THEME: Record<Theme, Record<string, string>> = {
  light: {
    primaryColor: "#F3F3F0",
    primaryBorderColor: "#8E1B31",
    primaryTextColor: "#141816",
    lineColor: "#535A56",
    secondaryColor: "#FBFBF9",
    tertiaryColor: "#F3F3F0",
  },
  dark: {
    primaryColor: "#1D2220",
    primaryBorderColor: "#F0919F",
    primaryTextColor: "#ECEEEC",
    lineColor: "#A4ABA7",
    secondaryColor: "#161A18",
    tertiaryColor: "#1D2220",
  },
};

/** Diagramma ER renderizzato con Mermaid (caricato solo su questa pagina); si ridisegna quando cambia il tema. */
export function ErDiagram() {
  const ref = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const { u } = useLang();
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          themeVariables: {
            ...MERMAID_THEME[theme],
            fontFamily: "var(--font-geist-mono), 'SFMono-Regular', monospace",
            fontSize: "13px",
          },
          er: { minEntityWidth: 100, minEntityHeight: 60, entityPadding: 12 },
        });
        const { svg } = await mermaid.render(`er-${Math.random().toString(36).slice(2)}`, ER_DIAGRAM);
        if (cancelled || !ref.current) return;
        ref.current.innerHTML = svg;
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [theme]);

  return (
    <div className="overflow-auto border-y border-ink/15 bg-raised p-4">
      <div ref={ref} className="min-h-40 min-w-max" role="img" aria-label={u.diagramLabel} />
      {status === "loading" && <p className="font-mono text-[13px] text-ink-soft">{u.diagramLoading}</p>}
      {status === "failed" && <p className="font-mono text-[13px] text-ink-soft">{u.diagramFailed}</p>}
    </div>
  );
}

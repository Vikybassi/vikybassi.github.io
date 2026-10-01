"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Btn, Eyebrow } from "@/components/site/primitives";
import { asset, pageRoute } from "@/lib/asset";
import { useLang } from "@/lib/i18n";
import type { ProjectItem } from "@/data/types";

/** Il racconto di un progetto: contesto e anno, nome, cosa è, descrizione, tecnologie, link e dettagli. Niente riquadri. */
export function ProjectText({ item }: { item: ProjectItem }) {
  const { t, href } = useLang();
  const p = t.projects;
  const [open, setOpen] = useState(false);
  // Una sola azione piena per progetto (la demo, se c'è); le altre sono link di testo
  const primary = item.demoUrl ? "demo" : null;

  return (
    <div>
      <Eyebrow>{item.eyebrow}</Eyebrow>
      <h2 className="mt-3 font-display text-[38px] font-bold leading-[0.98] tracking-[-0.035em] md:text-[52px]">{item.title}</h2>
      {item.subtitle && <p className="mt-3 max-w-[36ch] text-[19px] leading-snug text-ink md:text-[21px]">{item.subtitle}</p>}
      <p className="mt-5 max-w-[62ch] text-[16.5px] leading-relaxed text-ink-soft">{item.description}</p>
      <p className="mt-5 font-mono text-[12.5px] leading-relaxed text-ink-soft">
        {item.tags.join("  ·  ")}
        {item.showSoon && `  ·  ${p.soon}`}
      </p>

      {(item.demoUrl || item.repoUrl || item.docUrl || item.schemaUrl) && (
        <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-1">
          {item.demoUrl && (
            <Btn href={item.demoUrl} external variant={primary === "demo" ? "primary" : "link"}>
              {p.demoLabel}
            </Btn>
          )}
          {item.repoUrl && (
            <Btn href={item.repoUrl} external variant="link">
              {p.repoLabel}
            </Btn>
          )}
          {item.docUrl && (
            <Btn href={asset(item.docUrl)} external variant="link">
              {p.docLabel}
            </Btn>
          )}
          {item.schemaUrl && (
            <Btn href={href(pageRoute(item.schemaUrl))} variant="link">
              {p.schemaLabel}
            </Btn>
          )}
        </div>
      )}
      {item.demoNote && <p className="mt-3 max-w-[62ch] text-[13.5px] italic text-ink-soft">{item.demoNote}</p>}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="mt-6 inline-flex min-h-11 items-center gap-2 text-[15px] font-medium text-accent"
      >
        {open ? p.hide : p.details}
        <motion.span animate={{ rotate: open ? 180 : 0 }} aria-hidden="true">
          ⌄
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="overflow-hidden"
        aria-hidden={!open}
      >
        <ul className="max-w-[62ch] pt-3">
          {item.bullets.map((b) => (
            <li key={b} className="border-t border-line py-3 text-[15px] text-ink-soft first:border-t-0">
              {b}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}

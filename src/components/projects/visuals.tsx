"use client";

import { useMemo, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { PhoneVideo, ScreenshotCarousel } from "@/components/projects/media";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { ProjectItem } from "@/data/types";

/** Il fondo delle visuali disegnate (rete, catena, tabelle): un pannello appena rialzato, come le cornici degli screenshot. */
function Stage({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("relative rounded-md bg-raised p-6 ring-1 ring-line md:p-10", className)}>{children}</div>;
}

// Generatore pseudo-casuale con seme fisso: la rete ha sempre lo stesso disegno (niente differenze tra server e client).
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Coordinate arrotondate: le ultime cifre decimali di Math.cos/sin possono differire tra server e browser e far fallire l'idratazione.
const q = (v: number) => Math.round(v * 100) / 100;

const CLUSTER_FILL = ["fill-accent", "fill-teal", "fill-gold", "fill-accent-soft", "fill-ink-soft"];
const CLUSTER_STROKE = ["stroke-accent", "stroke-teal", "stroke-gold", "stroke-accent-soft", "stroke-ink-soft"];

/** Cinque comunità di nodi fittamente collegati al loro interno e più radi tra loro: l'idea dello studio sui commenti di YouTube Shorts. */
export function NetworkViz({ caption }: { caption?: string }) {
  const reduce = useReducedMotion();
  const { clusters, bridges } = useMemo(() => {
    const rand = rng(7);
    const centers = Array.from({ length: 5 }, (_, i) => {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      return { x: q(300 + Math.cos(a) * 150), y: q(210 + Math.sin(a) * 118) };
    });
    const clusters = centers.map((c, ci) => {
      const nodes = Array.from({ length: 30 }, () => {
        const a = rand() * Math.PI * 2;
        const r = Math.sqrt(rand()) * 76;
        return { x: q(c.x + Math.cos(a) * r), y: q(c.y + Math.sin(a) * r * 0.85), r: q(1.6 + rand() * 2.6) };
      });
      const edges: [number, number][] = [];
      nodes.forEach((n, i) => {
        nodes
          .map((m, j) => ({ j, d: (m.x - n.x) ** 2 + (m.y - n.y) ** 2 }))
          .filter((o) => o.j !== i)
          .sort((p, q) => p.d - q.d)
          .slice(0, 4)
          .forEach((o) => edges.push([i, o.j]));
      });
      return { ci, nodes, edges, center: c };
    });
    const bridges = clusters.map((c, i) => [c.center, clusters[(i + 1) % 5].center] as const);
    return { clusters, bridges };
  }, []);

  return (
    <div>
      <svg viewBox="0 0 600 420" className="w-full" aria-hidden="true">
        {bridges.map(([a, b], i) => (
          <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="stroke-ink-soft/25" strokeWidth={1} strokeDasharray="3 5" />
        ))}
        {clusters.map((c) => (
          <motion.g
            key={c.ci}
            animate={reduce ? undefined : { x: [0, c.ci % 2 ? 7 : -7, 0], y: [0, c.ci % 3 ? -6 : 6, 0] }}
            transition={{ duration: 7 + c.ci * 1.3, repeat: Infinity, ease: "easeInOut" }}
          >
            {c.edges.map(([i, j], k) => (
              <line
                key={k}
                x1={c.nodes[i].x}
                y1={c.nodes[i].y}
                x2={c.nodes[j].x}
                y2={c.nodes[j].y}
                className={cn(CLUSTER_STROKE[c.ci], "opacity-30")}
                strokeWidth={0.7}
              />
            ))}
            {c.nodes.map((n, k) => (
              <circle key={k} cx={n.x} cy={n.y} r={n.r} className={CLUSTER_FILL[c.ci]} />
            ))}
          </motion.g>
        ))}
      </svg>
      {caption && <p className="mt-4 text-center font-mono text-[12.5px] tracking-wide text-ink-soft">{caption}</p>}
    </div>
  );
}

/** Blocchi che si concatenano uno dopo l'altro, con un impulso che percorre la catena. */
export function ChainViz({ caption }: { caption?: string }) {
  const reduce = useReducedMotion();
  const blocks = [0, 1, 2, 3, 4];
  return (
    <div>
      <svg viewBox="0 0 600 200" className="w-full" aria-hidden="true">
        {blocks.slice(0, -1).map((i) => (
          <line key={i} x1={56 + i * 118 + 66} y1={100} x2={56 + (i + 1) * 118} y2={100} className="stroke-ink-soft/40" strokeWidth={2} />
        ))}
        {blocks.map((i) => (
          <motion.rect
            key={i}
            x={56 + i * 118}
            y={60}
            width={66}
            height={80}
            rx={3}
            className={cn("stroke-accent", i % 2 ? "fill-accent/10" : "fill-teal/15")}
            strokeWidth={1.5}
            animate={reduce ? undefined : { y: [60, 54, 60], opacity: [0.75, 1, 0.75] }}
            transition={{ duration: 3.2, repeat: Infinity, delay: i * 0.45, ease: "easeInOut" }}
          />
        ))}
        {!reduce && (
          <motion.circle
            r={5}
            cx={56}
            cy={100}
            className="fill-gold"
            animate={{ x: [0, 4 * 118 + 66], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
          />
        )}
      </svg>
      {caption && <p className="mt-4 text-center font-mono text-[12.5px] tracking-wide text-ink-soft">{caption}</p>}
    </div>
  );
}

/** Le 27 tabelle del database ospedaliero, raggruppate per area: i nomi sono quelli veri dello schema. */
export function SchemaMap() {
  const { t } = useLang();
  const s = t.schema;
  return (
    <div>
      <div className="grid gap-x-5 gap-y-6 sm:grid-cols-[repeat(3,minmax(0,1fr))]">
        {s.domains.map((d, di) => (
          <div key={d.label}>
            <p className="border-b border-line pb-2 text-[13px] font-medium text-accent">{d.label}</p>
            <ul className="mt-3 space-y-1.5">
              {d.rows.map((r, ri) => (
                <motion.li
                  key={r.name}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: di * 0.1 + ri * 0.03, duration: 0.35 }}
                  className="font-mono text-[11.5px] leading-tight text-ink-soft [overflow-wrap:anywhere]"
                >
                  {r.name}
                </motion.li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

/** La visuale di un progetto: screenshot, video, rete, catena o mappa delle tabelle, a seconda dei dati. */
export function ProjectVisual({ item }: { item: ProjectItem }) {
  if (item.screenshots) return <ScreenshotCarousel images={item.screenshots} title={item.title} />;
  if (item.video)
    return (
      <Stage className="flex justify-center py-10">
        <PhoneVideo src={item.video} className="w-[270px]" />
      </Stage>
    );
  if (item.diagram === "network")
    return (
      <Stage>
        <NetworkViz caption={item.diagramCaption} />
      </Stage>
    );
  if (item.diagram === "chain")
    return (
      <Stage className="py-16">
        <ChainViz caption={item.diagramCaption} />
      </Stage>
    );
  if (item.schemaUrl)
    return (
      <Stage>
        <SchemaMap />
      </Stage>
    );
  return null;
}

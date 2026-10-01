"use client";

import { useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { ContactCta } from "@/components/site/contact-cta";
import { Reveal } from "@/components/site/reveal";
import { SectionIntro, SectionTitle, Wrap } from "@/components/site/primitives";
import { TracingBeam } from "@/components/ui/tracing-beam";
import { asset } from "@/lib/asset";
import { useLang } from "@/lib/i18n";

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((b) => (
        <li key={b} className="text-[15px] text-ink-soft">
          {b}
        </li>
      ))}
    </ul>
  );
}

/** Voce di timeline: date a sinistra, contenuto a destra (come .timeline-item del vecchio sito). */
function TimelineItem({ dates, title, org, children }: { dates: string; title: string; org: string; children?: ReactNode }) {
  return (
    <Reveal className="grid gap-1.5 border-t border-line py-6 first:border-t-0 md:grid-cols-[190px_1fr] md:gap-6">
      <div className="tabular pt-[3px] font-mono text-[13px] text-ink-soft">{dates}</div>
      <div>
        <h3 className="font-display text-[21px] font-bold leading-snug tracking-[-0.015em]">{title}</h3>
        <p className="mb-3 mt-0.5 text-[14px] text-ink-soft">{org}</p>
        {children}
      </div>
    </Reveal>
  );
}

function MetaBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="border-t border-ink/15 pt-5">
      <span className="text-[14px] font-medium text-accent">{label}</span>
      <p className="mt-3 font-display text-[22px] font-semibold leading-snug tracking-[-0.01em]">{text}</p>
    </div>
  );
}

/** Certificati come elenco: passando sopra una riga la macchia di colore scivola da una all'altra (schema "Card Hover Effect" di Aceternity). */
function Certifications() {
  const { t, u } = useLang();
  const r = t.resume;
  const [hover, setHover] = useState<number | null>(null);
  return (
    <Wrap className="mt-24 md:mt-32">
      <Reveal>
        <SectionTitle>{r.certificationsTitle}</SectionTitle>
      </Reveal>
      <ul className="mt-10 border-t border-ink/15" onMouseLeave={() => setHover(null)}>
        {r.certifications.map((cert, i) => {
          const inner = (
            <>
              <span className="text-[13.5px] font-medium text-ink-soft">{cert.issuer}</span>
              <span>
                <h3 className="font-display text-[24px] font-bold leading-snug tracking-[-0.02em]">{cert.title}</h3>
                <p className="mt-2 max-w-xl text-[14.5px] text-ink-soft">{cert.desc}</p>
              </span>
              {/* Senza cert.file non c'è un documento pubblico da mostrare (es. conterrebbe dati personali): niente link né etichetta "vedi". */}
              {cert.file && (
                <span className="text-[14.5px] font-medium text-accent">
                  {r.certViewLabel}
                  <span className="sr-only"> {u.newTab}</span>
                </span>
              )}
            </>
          );
          return (
            <li key={cert.title} className="relative border-b border-ink/15" onMouseEnter={() => setHover(i)}>
              {hover === i && (
                <motion.span
                  layoutId="cert-hover"
                  aria-hidden="true"
                  className="absolute inset-y-0 -inset-x-4 rounded-md bg-ink/[0.05]"
                  transition={{ type: "spring", stiffness: 380, damping: 36 }}
                />
              )}
              {cert.file ? (
                <a
                  href={asset(cert.file)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative grid gap-2 py-7 md:grid-cols-[260px_1fr_auto] md:items-baseline md:gap-8"
                >
                  {inner}
                </a>
              ) : (
                <div className="relative grid gap-2 py-7 md:grid-cols-[260px_1fr_auto] md:items-baseline md:gap-8">
                  {inner}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Wrap>
  );
}

/** Il lato "curriculum": formazione, esperienza, competenze, certificazioni, lingue. Prima era in fondo a "Chi sono",
 *  ora è una pagina a parte (troppa roba in una sola, per usare le parole di chi l'ha chiesto). */
export function ResumeView() {
  const { t } = useLang();
  const r = t.resume;

  return (
    <>
      <Wrap className="pt-32">
        <SectionTitle as="h1" className="text-[56px] leading-[0.9] tracking-[-0.045em] md:text-[112px]">
          {r.title}
        </SectionTitle>
        <SectionIntro className="text-[18px]">{r.intro}</SectionIntro>
      </Wrap>

      {/* Formazione + Esperienza: linea che si traccia con lo scroll (Tracing Beam di Aceternity UI) */}
      <Wrap className="mt-16 md:mt-20">
        <div className="pl-8 md:pl-20">
          <TracingBeam className="mx-0 max-w-none">
            <section>
              <SectionTitle>{r.educationTitle}</SectionTitle>
              <div className="mt-6">
                <TimelineItem dates={r.degree.dates} title={r.degree.title} org={r.degree.org}>
                  <div className="space-y-5">
                    {r.educationBlocks.map((block) => (
                      <div key={block.label}>
                        <span className="mb-2 block text-[14px] font-medium text-accent">
                          {block.label}
                        </span>
                        <Bullets items={block.bullets} />
                      </div>
                    ))}
                  </div>
                </TimelineItem>
                <TimelineItem dates={r.diploma.dates} title={r.diploma.title} org={r.diploma.org} />
              </div>
            </section>

            <section className="mt-16">
              <SectionTitle>{r.experienceTitle}</SectionTitle>
              <div className="mt-6">
                {r.experience.map((exp) => (
                  <TimelineItem key={exp.title} dates={exp.dates} title={exp.title} org={exp.org}>
                    <Bullets items={exp.bullets} />
                  </TimelineItem>
                ))}
              </div>
            </section>
          </TracingBeam>
        </div>
      </Wrap>

      {/* Competenze: elenco editoriale, un gruppo per riga */}
      <Wrap className="mt-24 md:mt-32">
        <Reveal>
          <SectionTitle>{r.skillsTitle}</SectionTitle>
        </Reveal>
        <div className="mt-10 border-t border-ink/15">
          {r.skillGroups.map((group, i) => (
            <Reveal key={group.label} delay={i * 0.06}>
              <div className="grid gap-3 border-b border-ink/15 py-7 md:grid-cols-[260px_1fr] md:gap-8">
                <span className="text-[14px] font-medium text-ink-soft">{group.label}</span>
                <p className="font-display text-[24px] font-semibold leading-[1.3] tracking-[-0.015em] md:text-[30px]">{group.items.join("  ·  ")}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Wrap>

      <Certifications />

      <Wrap className="mt-24 md:mt-32">
        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          <MetaBlock label={r.languagesTitle} text={r.languages} />
          <MetaBlock label={r.interestsTitle} text={r.interests} />
        </div>
      </Wrap>

      <ContactCta />
    </>
  );
}

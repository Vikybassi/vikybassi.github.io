"use client";

import Link from "next/link";
import { ContactCta } from "@/components/site/contact-cta";
import { ErDiagram } from "@/components/schema/er-diagram";
import { Reveal } from "@/components/site/reveal";
import { Chip, Eyebrow, SectionIntro, SectionTitle, Wrap } from "@/components/site/primitives";
import { useLang } from "@/lib/i18n";

export function SchemaView() {
  const { t, href } = useLang();
  const s = t.schema;

  return (
    <>
      <Wrap className="pt-32">
        <Link
          href={href("/projects")}
          className="mb-8 inline-flex min-h-11 items-center text-[15px] font-medium text-accent underline-offset-4 hover:underline"
        >
          {s.backLink}
        </Link>
        <Eyebrow>{s.eyebrow}</Eyebrow>
        <SectionTitle as="h1" className="mt-3 text-[40px] leading-[0.95] tracking-[-0.04em] md:text-[72px]">
          {s.title}
        </SectionTitle>
        <SectionIntro className="text-[18px]">{s.subhead}</SectionIntro>
        <div className="mt-6 flex flex-wrap gap-2">
          <Chip>{s.metaTables}</Chip>
          <Chip>{s.metaChecks}</Chip>
          <Chip>{s.metaDb}</Chip>
        </div>
      </Wrap>

      <Wrap className="mt-20">
        <SectionTitle>{s.legendTitle}</SectionTitle>
        <SectionIntro>{s.legendIntro}</SectionIntro>
        <dl className="mt-8 grid border-y border-ink/15 sm:grid-cols-2 sm:gap-x-12">
          {s.legendItems.map((item) => (
            <div key={item.symbol} className="flex items-baseline gap-5 border-b border-ink/10 py-4 last:border-b-0 sm:[&:nth-last-child(2)]:border-b-0">
              <dt className="min-w-[72px] font-mono text-[14px] font-medium text-accent">{item.symbol}</dt>
              <dd className="text-[14.5px] text-ink-soft">{item.text}</dd>
            </div>
          ))}
        </dl>
      </Wrap>

      <Wrap className="mt-20">
        <SectionTitle>{s.diagramTitle}</SectionTitle>
        <SectionIntro>{s.diagramIntro}</SectionIntro>
        <div className="mt-8">
          <ErDiagram />
        </div>
        <p className="mt-3 font-mono text-[12px] italic text-ink-soft">{s.diagramCaption}</p>
      </Wrap>

      <Wrap className="mt-20">
        <SectionTitle>{s.rulesTitle}</SectionTitle>
        <SectionIntro>{s.rulesIntro}</SectionIntro>
        <ul className="mt-8 border-t border-ink/15">
          {s.rules.map((rule) => (
            <li
              key={rule.code}
              className="flex flex-col gap-1 border-b border-ink/15 py-4 sm:flex-row sm:items-baseline sm:gap-8"
            >
              <code className="min-w-[250px] font-mono text-[13px] text-accent">{rule.code}</code>
              <span className="text-[14.5px] text-ink-soft">{rule.text}</span>
            </li>
          ))}
        </ul>
      </Wrap>

      <Wrap className="mt-20">
        <SectionTitle>{s.dictTitle}</SectionTitle>
        <SectionIntro>{s.dictIntro}</SectionIntro>
        <div className="mt-10 space-y-14">
          {s.domains.map((domain) => (
            <Reveal key={domain.label}>
              <h3 className="text-[14px] font-medium text-accent">{domain.label}</h3>
              <div className="mt-4 border-t border-ink/25">
                {domain.rows.map((row) => (
                  <div
                    key={row.name}
                    className="grid gap-1 border-b border-ink/10 py-3 md:grid-cols-[210px_250px_1fr] md:gap-6"
                  >
                    <span className="font-mono text-[13px] font-medium text-ink">{row.name}</span>
                    <span className="font-mono text-[12.5px] text-accent-soft">{row.pk}</span>
                    <span className="text-[14px] text-ink-soft">{row.desc}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-10 font-mono text-[12px] italic text-ink-soft">{s.footNote}</p>
      </Wrap>

      <ContactCta />
    </>
  );
}

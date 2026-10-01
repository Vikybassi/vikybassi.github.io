"use client";

import { RootsPanels } from "@/components/about/roots-panels";
import { ContactCta } from "@/components/site/contact-cta";
import { LightboxProvider } from "@/components/site/lightbox";
import { Btn, SectionTitle, Wrap } from "@/components/site/primitives";
import { useLang } from "@/lib/i18n";

/** Il lato personale: chi sono e cosa mi muove fuori dallo schermo. Formazione, esperienza, competenze,
 *  certificazioni e lingue sono su una pagina a parte ("Percorso"/"resume"): troppa roba in una sola. */
export function AboutView() {
  const { t, href } = useLang();
  const a = t.about;

  return (
    <LightboxProvider>
      <Wrap className="pt-32">
        <SectionTitle as="h1" className="text-[56px] leading-[0.9] tracking-[-0.045em] md:text-[112px]">
          {a.title}
        </SectionTitle>
        <div className="mt-6 max-w-2xl space-y-4 text-[18px] leading-relaxed text-ink-soft">
          {a.bio.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </Wrap>

      <RootsPanels />

      <Wrap className="mt-10">
        <Btn href={href("/archive")} variant="link">
          {a.archiveLink}
        </Btn>
      </Wrap>

      <ContactCta />
    </LightboxProvider>
  );
}

"use client";

import { Btn, SectionTitle, Wrap } from "@/components/site/primitives";
import { Reveal } from "@/components/site/reveal";
import { useLang } from "@/lib/i18n";

const EMAIL = "vittoria.bassi02@gmail.com";
const LINKS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/vittoria-bassi/" },
  { label: "GitHub", href: "https://github.com/Vikybassi" },
];

/** Contatti in chiusura di ogni pagina: l'indirizzo email in grande (è il modo più diretto per scrivermi), poi LinkedIn e GitHub.
 *  Nessun filo sopra: le sezioni le separa il paesaggio sullo sfondo, un filo sul cielo sembrerebbe un taglio. */
export function ContactCta() {
  const { t } = useLang();
  const [user, domain] = EMAIL.split("@");
  return (
    <section id="contatti" data-section="contact" className="scroll-mt-24 py-24 md:py-36">
      <Wrap>
        <Reveal>
          <SectionTitle>{t.contact.title}</SectionTitle>
          <a
            href={`mailto:${EMAIL}`}
            className="mt-6 inline-block font-display text-[clamp(26px,6.2vw,80px)] font-bold leading-[1.05] tracking-[-0.04em] underline decoration-accent/35 decoration-2 underline-offset-[0.18em] transition-colors hover:text-accent hover:decoration-accent md:decoration-[3px]"
          >
            {/* Sul telefono l'indirizzo può andare a capo solo prima della chiocciola */}
            {user}
            <wbr />@{domain}
          </a>
          <div className="mt-8 flex flex-wrap gap-x-8">
            {LINKS.map((l) => (
              <Btn key={l.label} href={l.href} external variant="link" className="text-[17px]">
                {l.label}
              </Btn>
            ))}
          </div>
        </Reveal>
      </Wrap>
    </section>
  );
}

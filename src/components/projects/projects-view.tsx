"use client";

import { ContactCta } from "@/components/site/contact-cta";
import { LightboxProvider } from "@/components/site/lightbox";
import { SectionIntro, SectionTitle, Wrap } from "@/components/site/primitives";
import { StickyScrollReveal } from "@/components/ui/sticky-scroll-reveal";
import { ProjectText } from "@/components/projects/project-text";
import { ProjectVisual } from "@/components/projects/visuals";
import { useLang } from "@/lib/i18n";

export function ProjectsView() {
  const { t } = useLang();
  const p = t.projects;
  return (
    <LightboxProvider>
      <Wrap className="pt-32">
        <SectionTitle as="h1" className="text-[56px] leading-[0.9] tracking-[-0.045em] md:text-[112px]">
          {p.title}
        </SectionTitle>
        <SectionIntro className="text-[19px]">{p.intro}</SectionIntro>
      </Wrap>

      {/* Il testo scorre, la visuale resta ferma e cambia con il progetto (Sticky Scroll Reveal di Aceternity) */}
      <Wrap className="mt-6">
        <StickyScrollReveal
          items={p.items.map((item, i) => ({
            id: `project-${i}`,
            text: <ProjectText item={item} />,
            visual: <ProjectVisual item={item} />,
          }))}
        />
      </Wrap>

      <ContactCta />
    </LightboxProvider>
  );
}

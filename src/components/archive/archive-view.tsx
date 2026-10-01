"use client";

import { CurvedGallery } from "@/components/archive/curved-gallery";
import { ContactCta } from "@/components/site/contact-cta";
import { LightboxProvider } from "@/components/site/lightbox";
import { SectionIntro, SectionTitle, Wrap } from "@/components/site/primitives";
import { useLang } from "@/lib/i18n";

/** Archivio: quadri, montagne e sport su una galleria curva. Ci si arriva dalle Radici in "Chi sono". */
export function ArchiveView() {
  const { t } = useLang();
  const a = t.archive;

  return (
    <LightboxProvider>
      <Wrap className="pt-32">
        <SectionTitle as="h1" className="text-[56px] leading-[0.9] tracking-[-0.045em] md:text-[112px]">
          {a.title}
        </SectionTitle>
        <SectionIntro className="mt-6 text-[18px]">{a.intro}</SectionIntro>
      </Wrap>

      <CurvedGallery items={a.items} />

      <ContactCta />
    </LightboxProvider>
  );
}

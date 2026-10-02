"use client";

import { ContactCta } from "@/components/site/contact-cta";
import { Hero } from "@/components/home/hero";
import { FeaturedWork, Manifesto, Skills } from "@/components/home/home-sections";

/** Home: chi sono (hero), i progetti scelti, cosa mi muove, competenze, contatti.
 *  Lo sfondo (il Monte Disgrazia col tramonto) è comune a tutte le pagine: RidgeSky in SiteShell. */
export function HomeView() {
  return (
    <>
      <Hero />
      <FeaturedWork />
      <Manifesto />
      <Skills />
      <ContactCta />
    </>
  );
}

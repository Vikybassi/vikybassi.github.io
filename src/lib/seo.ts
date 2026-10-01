import type { Metadata } from "next";
import type { Lang } from "@/data/types";

export const SITE = "https://vikybassi.github.io";

// Colore della barra del browser sui telefoni: lo stesso fondo della pagina, chiaro o scuro.
export const THEME_COLORS = [
  { media: "(prefers-color-scheme: light)", color: "#F3F3F0" },
  { media: "(prefers-color-scheme: dark)", color: "#0F1211" },
];

export type PageKey = "home" | "projects" | "about" | "archive" | "resume" | "schema";

const ROUTE: Record<PageKey, string> = {
  home: "/",
  projects: "/projects",
  about: "/about",
  archive: "/archive",
  resume: "/resume",
  schema: "/schema-gestione-ospedaliera",
};

export const PAGES = Object.keys(ROUTE) as PageKey[];

// I testi italiani sono quelli del vecchio sito; quelli inglesi ne sono la traduzione.
const TEXT: Record<Lang, Record<PageKey, { title: string; description: string }>> = {
  it: {
    home: {
      title: "Vittoria Bassi · Portfolio",
      description: "Portfolio di Vittoria Bassi: sviluppo, dati, comunicazione digitale, pittura e sport.",
    },
    projects: {
      title: "Progetti · Vittoria Bassi",
      description: "Progetti di Vittoria Bassi: sviluppo, ricerca, pittura e sport.",
    },
    about: {
      title: "Chi sono · Vittoria Bassi",
      description: "Radici e passioni di Vittoria Bassi, fuori dallo schermo.",
    },
    archive: {
      title: "Archivio · Vittoria Bassi",
      description: "Quadri, montagne e sport di Vittoria Bassi, su una galleria che gira con lo scroll.",
    },
    resume: {
      title: "Percorso · Vittoria Bassi",
      description: "Formazione, esperienza, competenze, certificazioni e lingue di Vittoria Bassi.",
    },
    schema: {
      title: "Gestione Ospedaliera, schema ER · Vittoria Bassi",
      description:
        "Schema entità-relazione del database Gestione Ospedaliera: 27 tabelle, chiavi e vincoli ricostruiti dal dump SQL.",
    },
  },
  en: {
    home: {
      title: "Vittoria Bassi · Portfolio",
      description: "Portfolio of Vittoria Bassi: development, data, digital communication, painting and sport.",
    },
    projects: {
      title: "Projects · Vittoria Bassi",
      description: "Projects by Vittoria Bassi: development, research, painting and sport.",
    },
    about: {
      title: "About · Vittoria Bassi",
      description: "Roots and passions of Vittoria Bassi, beyond the screen.",
    },
    archive: {
      title: "Archive · Vittoria Bassi",
      description: "Paintings, mountains and sport by Vittoria Bassi, on a gallery that turns as you scroll.",
    },
    resume: {
      title: "Background · Vittoria Bassi",
      description: "Education, experience, skills, certifications and languages of Vittoria Bassi.",
    },
    schema: {
      title: "Hospital Management System, ER schema · Vittoria Bassi",
      description:
        "Entity-relationship schema of the Hospital Management database: 27 tables, keys and constraints reconstructed from the SQL dump.",
    },
  },
};

/** Indirizzo di una pagina nella lingua data: it -> "/about", en -> "/en/about". */
export function pathFor(lang: Lang, page: PageKey): string {
  const route = ROUTE[page];
  if (lang === "it") return route;
  return route === "/" ? "/en" : `/en${route}`;
}

/**
 * Copertina per le anteprime dei link (1200×630): le creste del Disgrazia al tramonto, come lo sfondo del sito, col nome
 * e la foto in vetta della home. Una per lingua, perché porta il sottotitolo.
 */
const OG_IMAGE: Record<Lang, string> = { it: "/og-image.jpg", en: "/og-image-en.jpg" };

/** Titolo, descrizione, indirizzo canonico, alternative di lingua (hreflang) e anteprime social. */
export function pageMetadata(lang: Lang, page: PageKey): Metadata {
  const { title, description } = TEXT[lang][page];
  const url = pathFor(lang, page);
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: { it: pathFor("it", page), en: pathFor("en", page), "x-default": pathFor("it", page) },
    },
    openGraph: {
      type: "website",
      siteName: "Vittoria Bassi",
      locale: lang === "it" ? "it_IT" : "en_US",
      alternateLocale: [lang === "it" ? "en_US" : "it_IT"],
      url,
      title,
      description,
      images: [{ url: OG_IMAGE[lang], width: 1200, height: 630, alt: "Vittoria Bassi · Portfolio" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE[lang]] },
  };
}

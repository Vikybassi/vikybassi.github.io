// Forma dei testi in src/data/translations.json (generato da i18n.js del vecchio portfolio).

export type Lang = "it" | "en";

export interface Pillar { label: string; desc: string }
/** Un progetto in evidenza in home: `project` è la sua posizione in projects.items (screenshot, video e link vengono da lì). */
export interface Featured { project: number; title: string; blurb: string }

export interface ProjectItem {
  eyebrow: string;
  title: string;
  /** Cosa è, in una riga: sotto il nome, al posto di un titolo lungo spezzato da un trattino. */
  subtitle?: string;
  description: string;
  tags: string[];
  showSoon: boolean;
  screenshots?: string[];
  demoUrl?: string;
  demoNote?: string;
  repoUrl?: string;
  docUrl?: string;
  schemaUrl?: string;
  video?: string;
  diagram?: "network" | "chain";
  diagramCaption?: string;
  bullets: string[];
}

export interface Translations {
  nav: { home: string; projects: string; about: string; archive: string; resume: string; cv: string };
  footer: { rights: string };
  home: {
    /** La parola sopra il nome nella hero: dice subito che cos'è il sito. */
    kicker: string;
    headline: string;
    subhead: string;
    ctaPrimary: string;
    ctaSecondary: string;
    pillarsTitle: string;
    /** invito al lab (il viaggio 3D, sito a parte) sotto "Cosa mi muove" */
    lab: { text: string; cta: string; href: string };
    pillars: Pillar[];
    featuredTitle: string;
    featured: Featured[];
    seeAll: string;
  };
  projects: {
    eyebrow: string;
    title: string;
    intro: string;
    details: string;
    hide: string;
    soon: string;
    galleryHint: string;
    demoLabel: string;
    repoLabel: string;
    docLabel: string;
    schemaLabel: string;
    items: ProjectItem[];
  };
  schema: {
    eyebrow: string;
    title: string;
    subhead: string;
    backLink: string;
    metaTables: string;
    metaChecks: string;
    metaDb: string;
    legendTitle: string;
    legendIntro: string;
    legendItems: { symbol: string; text: string }[];
    diagramTitle: string;
    diagramIntro: string;
    diagramCaption: string;
    rulesTitle: string;
    rulesIntro: string;
    rules: { code: string; text: string }[];
    dictTitle: string;
    dictIntro: string;
    domains: { label: string; rows: { name: string; pk: string; desc: string }[] }[];
    footNote: string;
  };
  about: {
    eyebrow: string;
    title: string;
    bio: string[];
    rootsTitle: string;
    rootsCards: {
      eyebrow: string;
      title: string;
      text: string;
      gallery: string[];
      /** Solo la radice Musica: la playlist Spotify, incorporata solo quando si preme il pulsante. */
      playlist?: { id: string; name: string; tracks: string; listen: string; open: string; privacy: string; frameTitle: string };
    }[];
    /** Il link dalle Radici all'Archivio (la galleria curva). */
    archiveLink: string;
  };
  /** Pagina Archivio: quadri e foto su una galleria curva che gira con lo scroll. */
  archive: {
    title: string;
    intro: string;
    prev: string;
    next: string;
    /** `pos`: quale parte dell'immagine tenere sulla carta verticale (object-position), se non il centro. */
    items: { src: string; title: string; note: string; pos?: string }[];
  };
  /** Il lato "curriculum": formazione, esperienza, competenze, certificazioni, lingue — pagina a parte da "Chi sono". */
  resume: {
    title: string;
    intro: string;
    educationTitle: string;
    degree: { title: string; org: string; dates: string };
    educationBlocks: { label: string; bullets: string[] }[];
    diploma: { title: string; org: string; dates: string };
    experienceTitle: string;
    experience: { title: string; org: string; dates: string; bullets: string[] }[];
    certificationsTitle: string;
    certViewLabel: string;
    /** file assente = nessun documento scaricabile pubblicato (es. contiene dati personali): la voce resta in elenco, senza link. */
    certifications: { issuer: string; title: string; desc: string; file?: string }[];
    skillsTitle: string;
    skillGroups: { label: string; items: string[] }[];
    languagesTitle: string;
    languages: string;
    interestsTitle: string;
    interests: string;
  };
  contact: { title: string };
}

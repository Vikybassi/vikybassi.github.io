"use client";

/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { PhoneVideo } from "@/components/projects/media";
import { Reveal } from "@/components/site/reveal";
import { Btn, Eyebrow, SectionTitle, Wrap } from "@/components/site/primitives";
import { asset, sizeOf } from "@/lib/asset";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { Featured, ProjectItem } from "@/data/types";

function hostOf(url?: string) {
  try {
    return url ? new URL(url).host : "";
  } catch {
    return "";
  }
}

/** Cornice da browser chiara: tre puntini e l'indirizzo vero del sito. */
function BrowserFrame({ host, children, className }: { host: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-md border border-line bg-raised shadow-[0_30px_60px_-40px_color-mix(in_oklab,var(--ink)_45%,transparent)]", className)}>
      <div aria-hidden="true" className="flex items-center gap-3 border-b border-line px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
        </span>
        <span className="mx-auto min-w-0 truncate font-mono text-[11.5px] text-ink-soft">{host}</span>
        <span className="hidden w-[42px] md:block" />
      </div>
      {children}
    </div>
  );
}

function Shot({ src, alt, eager }: { src: string; alt: string; eager?: boolean }) {
  const size = sizeOf(src);
  return (
    <img
      src={asset(src)}
      alt={alt}
      width={size?.w}
      height={size?.h}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className="block h-auto w-full"
    />
  );
}

/** Titolo, riga di descrizione e link di un progetto in evidenza. */
function FeatureText({ feat, item, size = "md" }: { feat: Featured; item: ProjectItem; size?: "lg" | "md" }) {
  const { t } = useLang();
  return (
    <>
      <Eyebrow>{item.eyebrow}</Eyebrow>
      <h3
        className={cn(
          "mt-2 font-display font-bold tracking-[-0.035em]",
          size === "lg" ? "text-[44px] leading-[0.95] md:text-[76px]" : "text-[32px] leading-none md:text-[40px]",
        )}
      >
        {feat.title}
      </h3>
      <p className={cn("mt-4 max-w-[46ch] text-ink-soft", size === "lg" && "text-[18px]")}>{feat.blurb}</p>
      <div className="mt-4 flex flex-wrap items-center gap-x-7">
        {item.demoUrl &&
          (size === "lg" ? (
            <Btn href={item.demoUrl} external className="mt-2">
              {t.projects.demoLabel}
            </Btn>
          ) : (
            <Btn href={item.demoUrl} external variant="link">
              {t.projects.demoLabel}
            </Btn>
          ))}
        {item.repoUrl && (
          <Btn href={item.repoUrl} external variant="link" className={size === "lg" ? "mt-2" : undefined}>
            {t.projects.repoLabel}
          </Btn>
        )}
      </div>
    </>
  );
}

/**
 * Progetti scelti. PiccoliPassi in grande: la finestra con la schermata dell'analisi di gruppo si raddrizza mentre scorri
 * (Container Scroll di Aceternity) e una seconda finestra, il profilo individuale, sporge dal bordo. Sotto, affiancati e
 * di larghezze diverse, Fotogram (il video dell'app nel telefono) e Rientro prima del buio (la mappa di tutti i giri).
 * Quali progetti e in che ordine lo decide home.featured in translations.json.
 */
export function FeaturedWork() {
  const { t, u, href } = useLang();
  const [lead, ...rest] = t.home.featured;
  const leadItem = t.projects.items[lead.project];
  const shots = leadItem.screenshots ?? [];
  // Le schermate sono in ordine di "vetrina" (translations.json): la prima è l'analisi di gruppo, la seconda il bilancio
  // delle competenze con i livelli raggiunti (grafici a colori, leggibili anche nella finestra piccola).
  const main = shots[0];
  const second = shots[1];

  return (
    <section className="py-24 md:py-36">
      <Wrap>
        <Reveal>
          <SectionTitle>{t.home.featuredTitle}</SectionTitle>
        </Reveal>
      </Wrap>

      <ContainerScroll
        className="mt-12 md:mt-16"
        header={
          <Wrap>
            <Reveal className="max-w-3xl">
              <FeatureText feat={lead} item={leadItem} size="lg" />
            </Reveal>
          </Wrap>
        }
        aside={
          second && (
            <BrowserFrame host={hostOf(leadItem.demoUrl)}>
              <Shot src={second} alt="" />
            </BrowserFrame>
          )
        }
      >
        {main && (
          <BrowserFrame host={hostOf(leadItem.demoUrl)} className="rounded-none border-0 shadow-none">
            <Shot src={main} alt={u.screenshotAlt(lead.title, shots.indexOf(main) + 1, shots.length)} />
          </BrowserFrame>
        )}
      </ContainerScroll>

      <Wrap className="mt-32 grid gap-20 md:mt-56 md:grid-cols-12 md:gap-10">
        {rest.map((feat, i) => {
          const item = t.projects.items[feat.project];
          return (
            // la larghezza la decide il tipo di visuale (telefono stretto, finestra del browser larga), non l'ordine;
            // il secondo scende un po', per non avere due blocchi allineati come in una tabella
            <Reveal
              key={feat.title}
              delay={i * 0.08}
              className={cn(item.video ? "md:col-span-5" : "md:col-span-7", i > 0 && "md:mt-24")}
            >
              <article>
                {item.video ? (
                  <div className="flex justify-center rounded-md bg-raised py-10 ring-1 ring-line">
                    <PhoneVideo src={item.video} />
                  </div>
                ) : (
                  item.screenshots?.[0] && (
                    <BrowserFrame host={hostOf(item.demoUrl)}>
                      <Shot src={item.screenshots[0]} alt={u.screenshotAlt(feat.title, 1, item.screenshots.length)} />
                    </BrowserFrame>
                  )
                )}
                <div className="mt-7">
                  <FeatureText feat={feat} item={item} />
                </div>
              </article>
            </Reveal>
          );
        })}
      </Wrap>

      <Wrap className="mt-20 md:mt-28">
        <Btn href={href("/projects")} variant="link" className="font-display text-[26px] font-bold tracking-[-0.02em] md:text-[34px]">
          {t.home.seeAll}
        </Btn>
      </Wrap>
    </section>
  );
}

// Le foto delle celle di "Cosa mi muove": un quadro e una foto in montagna, già usati in Chi sono.
const PAINTING = "media/quadri/quadro-2.jpg";
const MOUNTAIN = "media/sport/sport-2.jpg";

function CellImage({ src, alt, position = "50% 50%" }: { src: string; alt: string; position?: string }) {
  const size = sizeOf(src);
  return (
    <div className="relative aspect-[4/3] overflow-hidden md:aspect-auto md:flex-1">
      <img
        src={asset(src)}
        alt={alt}
        width={size?.w}
        height={size?.h}
        loading="lazy"
        decoding="async"
        style={{ objectPosition: position }}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
      />
    </div>
  );
}

/**
 * "Cosa mi muove": cinque celle, cinque trattamenti diversi. Sviluppo e dati larga; comunicazione piena di bordeaux;
 * gli animali in negativo; pittura e montagna alte, con un quadro e una foto veri. Nessuna cella vuota: 4 colonne × 2 righe
 * riempite esattamente. Sul telefono è una colonna sola, nell'ordine dei testi.
 */
export function Manifesto() {
  const { t, u } = useLang();
  const [dev, comm, paint, mountain, animals] = t.home.pillars;
  const title = "font-display text-[28px] font-bold leading-none tracking-[-0.03em] md:text-[34px]";

  return (
    <section className="py-24 md:py-36">
      <Wrap>
        <Reveal>
          <SectionTitle>{t.home.pillarsTitle}</SectionTitle>
        </Reveal>
        <div className="mt-10 grid gap-3 md:mt-14 md:grid-cols-4 md:grid-rows-[minmax(250px,auto)_minmax(250px,auto)]">
          <Reveal className="flex flex-col justify-between rounded-md bg-raised p-7 ring-1 ring-line md:col-span-2 md:col-start-1 md:row-start-1 md:p-9">
            <h3 className={cn(title, "md:text-[46px]")}>{dev.label}</h3>
            <p className="mt-10 max-w-[40ch] font-mono text-[14px] leading-relaxed text-ink-soft">{dev.desc}</p>
          </Reveal>
          <Reveal delay={0.05} className="flex flex-col justify-between rounded-md bg-bordeaux p-7 text-white md:col-start-1 md:row-start-2">
            <h3 className={title}>{comm.label}</h3>
            <p className="mt-8 text-[15px] text-white/85">{comm.desc}</p>
          </Reveal>
          <Reveal delay={0.1} className="flex flex-col justify-between rounded-md bg-ink p-7 text-paper md:col-start-2 md:row-start-2">
            <h3 className={title}>{animals.label}</h3>
            <p className="mt-8 text-[15px] text-paper/80">{animals.desc}</p>
          </Reveal>
          <Reveal delay={0.15} className="group flex flex-col overflow-hidden rounded-md bg-raised ring-1 ring-line md:col-start-3 md:row-span-2 md:row-start-1">
            <CellImage src={PAINTING} alt={u.paintingAlt} position="58% 40%" />
            <div className="p-7">
              <h3 className={title}>{paint.label}</h3>
              <p className="mt-3 text-[15px] text-ink-soft">{paint.desc}</p>
            </div>
          </Reveal>
          <Reveal delay={0.2} className="group flex flex-col overflow-hidden rounded-md bg-raised ring-1 ring-line md:col-start-4 md:row-span-2 md:row-start-1">
            <CellImage src={MOUNTAIN} alt={u.mountainAlt} />
            <div className="p-7">
              <h3 className={title}>{mountain.label}</h3>
              <p className="mt-3 text-[15px] text-ink-soft">{mountain.desc}</p>
            </div>
          </Reveal>
        </div>
        {/* il viaggio 3D vive in un sito a parte (il lab): qui solo un invito, per chi ha voglia di giocare */}
        <Reveal className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-1 md:mt-12">
          <p className="text-[17px] text-ink-soft">{t.home.lab.text}</p>
          <Btn href={t.home.lab.href} external variant="link">
            {t.home.lab.cta}
          </Btn>
        </Reveal>
      </Wrap>
    </section>
  );
}

/** Le competenze già presenti in "Percorso", in quattro colonne tipografiche: il gruppo sopra, le voci sotto. */
export function Skills() {
  const { t } = useLang();
  const r = t.resume;
  return (
    <section className="py-24 md:py-32">
      <Wrap>
        <Reveal>
          <SectionTitle>{r.skillsTitle}</SectionTitle>
        </Reveal>
        <div className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {r.skillGroups.map((group, i) => (
            <Reveal key={group.label} delay={i * 0.06}>
              <h3 className="border-b border-line pb-3 text-[14px] font-medium text-ink-soft">{group.label}</h3>
              <ul className="mt-4 space-y-1.5">
                {group.items.map((skill) => (
                  <li key={skill} className="font-display text-[21px] font-semibold leading-snug tracking-[-0.01em]">
                    {skill}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </Wrap>
    </section>
  );
}

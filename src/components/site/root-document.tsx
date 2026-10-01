import "@/app/globals.css";
import type { ReactNode } from "react";
import type { Lang } from "@/data/types";
import { fontVariables } from "@/lib/fonts";
import { SITE } from "@/lib/seo";
import { THEME_INIT_SCRIPT } from "@/lib/theme-script";
import { SiteShell } from "@/components/site/site-shell";

// Dati strutturati (schema.org): dicono ai motori di ricerca chi è la persona e dove trovarla. Solo dati già pubblici sul sito.
const PERSON = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Vittoria Bassi",
  url: SITE,
  email: "mailto:vittoria.bassi02@gmail.com",
  sameAs: ["https://www.linkedin.com/in/vittoria-bassi/", "https://github.com/Vikybassi"],
};

/** <html> di una lingua: ogni lingua ha il suo layout radice, così `lang` è giusto già nell'HTML statico. */
export function RootDocument({ lang, children }: { lang: Lang; children: ReactNode }) {
  return (
    <html lang={lang} className={fontVariables} suppressHydrationWarning>
      <body>
        {/* Script del tema come primo elemento del <body> (si esegue prima che il contenuto venga disegnato, quindi niente lampo).
            Non sta in un <head> nostro: in produzione Netlify inserisce commenti e meta nell'<head> e, con un <head> gestito da noi,
            React non riconosceva più la struttura e ridisegnava tutta la pagina (errore #418). */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <noscript>
          {/* Senza JavaScript le animazioni d'ingresso non partono: mostra comunque tutto */}
          <style>{`[style*="opacity:0"],[style*="opacity: 0"]{opacity:1!important;transform:none!important;filter:none!important}`}</style>
        </noscript>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON) }} />
        <SiteShell lang={lang}>{children}</SiteShell>
      </body>
    </html>
  );
}

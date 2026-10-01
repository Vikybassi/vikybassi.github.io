import type { ReactNode } from "react";
import type { Lang } from "@/data/types";
import { LangProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import { MotionProvider } from "@/components/site/motion-provider";
import { RidgeSky } from "@/components/site/ridge-sky";
import { ScrollProgress } from "@/components/site/scroll-progress";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteNav } from "@/components/site/site-nav";
import { SkipLink } from "@/components/site/skip-link";
import { SmoothScroll } from "@/components/site/smooth-scroll";

/** Cornice comune a tutte le pagine: lingua, tema, animazioni, navigazione, contenuto, footer. */
export function SiteShell({ lang, children }: { lang: Lang; children: ReactNode }) {
  return (
    <LangProvider lang={lang}>
      <ThemeProvider>
        <MotionProvider>
          <SmoothScroll />
          <RidgeSky />
          <SkipLink />
          <ScrollProgress />
          <SiteNav />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <SiteFooter />
        </MotionProvider>
      </ThemeProvider>
    </LangProvider>
  );
}

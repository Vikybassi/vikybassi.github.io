"use client";

import { useState } from "react";
import Link from "next/link";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { useLang } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import {
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavBody,
  NavItems,
  Navbar,
  NavbarButton,
  NavbarLogo,
} from "@/components/ui/resizable-navbar";
import { cn } from "@/lib/utils";

function LangToggle({ className }: { className?: string }) {
  const { lang, setLang, u } = useLang();
  return (
    <div
      role="group"
      aria-label={u.language}
      className={cn(
        "relative z-20 inline-flex items-center text-[13.5px] font-medium",
        className,
      )}
    >
      {(["it", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-label={l === "it" ? "Italiano" : "English"}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={cn(
            "flex h-9 min-w-9 items-center justify-center rounded-md px-2 uppercase transition-colors",
            lang === l ? "text-ink underline decoration-accent decoration-2 underline-offset-[6px]" : "text-ink-soft hover:text-ink",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const { u } = useLang();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? u.themeToLight : u.themeToDark}
      className="relative z-20 flex h-9 w-9 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-ink/[0.06] hover:text-ink"
    >
      {/* Le due icone si alternano via CSS (classe .dark su <html>): nessun lampo al caricamento */}
      <IconSun className="hidden dark:block" size={16} aria-hidden="true" />
      <IconMoon className="dark:hidden" size={16} aria-hidden="true" />
    </button>
  );
}

export function SiteNav() {
  const { t, lang, u, href } = useLang();
  const [open, setOpen] = useState(false);

  const items = [
    { name: t.nav.home, link: href("/") },
    { name: t.nav.projects, link: href("/projects") },
    { name: t.nav.about, link: href("/about") },
    { name: t.nav.resume, link: href("/resume") },
    { name: t.nav.archive, link: href("/archive") },
  ];
  // Il CV scaricato segue la lingua, come sul vecchio sito.
  const cvHref = lang === "en" ? "/cv/cv-en.pdf" : "/cv/cv-it.pdf";
  const cvLabel = (
    <>
      {t.nav.cv} <span aria-hidden="true">↓</span>
      <span className="sr-only"> {u.newTab}</span>
    </>
  );

  return (
    <header>
    <Navbar>
      <NavBody>
        <NavbarLogo href={href("/")} label={u.home} />
        <NavItems items={items} label={u.mainNav} />
        <div className="relative z-20 flex items-center gap-1.5">
          <LangToggle />
          <ThemeToggle />
          <NavbarButton href={cvHref} target="_blank" rel="noopener">
            {cvLabel}
          </NavbarButton>
        </div>
      </NavBody>

      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo href={href("/")} label={u.home} />
          <MobileNavToggle isOpen={open} onClick={() => setOpen((o) => !o)} label={u.menu} />
        </MobileNavHeader>
        <MobileNavMenu isOpen={open} onClose={() => setOpen(false)}>
          <nav aria-label={u.mainNav} className="flex flex-col gap-4">
            {items.map((item) => (
              <Link key={item.link} href={item.link} onClick={() => setOpen(false)} className="font-display text-[26px] font-bold tracking-[-0.02em] text-ink">
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="flex w-full items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2.5">
              <LangToggle />
              <ThemeToggle />
            </div>
            <NavbarButton href={cvHref} target="_blank" rel="noopener">
              {cvLabel}
            </NavbarButton>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
    </header>
  );
}

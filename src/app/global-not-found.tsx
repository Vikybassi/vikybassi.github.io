import "./globals.css";
import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import { THEME_INIT_SCRIPT } from "@/lib/theme-script";
import { ui } from "@/data/ui";

export const metadata: Metadata = { title: "404 · Vittoria Bassi", robots: { index: false } };

// Pagina 404 unica per tutto il sito (le due lingue hanno layout radice separati): testo in italiano e inglese.
export default function GlobalNotFound() {
  return (
    <html lang="it" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <main className="mx-auto flex min-h-screen max-w-xl flex-col items-start justify-center gap-4 px-7">
          <p className="font-mono text-[13px] text-accent">404</p>
          <h1 className="font-display text-[38px] font-semibold leading-tight">
            {ui.it.notFoundTitle} <span className="text-ink-soft">· {ui.en.notFoundTitle}</span>
          </h1>
          <p className="text-ink-soft">{ui.it.notFoundText}</p>
          <p lang="en" className="text-ink-soft">
            {ui.en.notFoundText}
          </p>
          <div className="mt-4 flex gap-3 font-mono text-[13px]">
            {/* Navigazione completa voluta: la 404 globale non ha i layout delle due lingue */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a className="rounded-full bg-bordeaux px-5 py-2.5 text-white" href="/">
              {ui.it.notFoundBack}
            </a>
            <a className="rounded-full border border-ink/25 px-5 py-2.5 text-ink" href="/en" lang="en">
              {ui.en.notFoundBack}
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}

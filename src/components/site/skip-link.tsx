"use client";

import { useLang } from "@/lib/i18n";

/** Primo elemento raggiungibile con Tab: salta la navigazione e porta al contenuto. */
export function SkipLink() {
  const { u } = useLang();
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-bordeaux focus:px-4 focus:py-2 focus:font-mono focus:text-[13px] focus:text-white"
    >
      {u.skipToContent}
    </a>
  );
}

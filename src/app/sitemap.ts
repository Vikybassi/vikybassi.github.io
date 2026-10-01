import type { MetadataRoute } from "next";
import { PAGES, SITE, pathFor } from "@/lib/seo";

export const dynamic = "force-static";

// Tutte le pagine nelle due lingue, ognuna con il rimando alla sua versione nell'altra lingua (hreflang).
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return PAGES.flatMap((page) =>
    (["it", "en"] as const).map((lang) => ({
      url: SITE + pathFor(lang, page),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: page === "home" ? 1 : 0.7,
      alternates: { languages: { it: SITE + pathFor("it", page), en: SITE + pathFor("en", page) } },
    })),
  );
}

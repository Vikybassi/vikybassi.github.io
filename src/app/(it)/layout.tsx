import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { RootDocument } from "@/components/site/root-document";
import { SITE, THEME_COLORS } from "@/lib/seo";

export const metadata: Metadata = { metadataBase: new URL(SITE) };
export const viewport: Viewport = { themeColor: THEME_COLORS, colorScheme: "light dark" };

export default function Layout({ children }: { children: ReactNode }) {
  return <RootDocument lang="it">{children}</RootDocument>;
}

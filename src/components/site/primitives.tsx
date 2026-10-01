"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Wrap({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1240px] px-5 sm:px-8", className)}>{children}</div>;
}

/** Riga di contesto sopra un titolo (tipo di progetto, anno): testo piccolo in minuscolo, niente maiuscoletto decorativo. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("tabular text-[14px] font-medium text-ink-soft", className)}>{children}</p>;
}

export function SectionTitle({
  children,
  as: Tag = "h2",
  className,
}: {
  children: ReactNode;
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <Tag
      className={cn(
        "font-display text-[34px] font-bold leading-[1.02] tracking-[-0.03em] text-ink md:text-[48px]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function SectionIntro({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("mt-4 max-w-[60ch] text-[17px] text-ink-soft", className)}>{children}</p>;
}

/** Etichetta di un dato (numero di tabelle, vincoli…): rettangolo piccolo, non una pillola. */
export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-block rounded-[4px] border border-line bg-raised px-2.5 py-1 font-mono text-[12.5px] text-ink-soft", className)}>
      {children}
    </span>
  );
}

type BtnProps = {
  href: string;
  /** primary = pieno, l'azione principale della sezione; link = testo con freccia, per le azioni secondarie */
  variant?: "primary" | "link";
  external?: boolean;
  className?: string;
  children: ReactNode;
};

/** Bottone/link: interno con next/link, esterno e mailto con <a>. I link esterni avvisano i lettori di schermo che si aprono in una nuova scheda. */
export function Btn({ href, variant = "primary", external, className, children }: BtnProps) {
  const { u } = useLang();
  const cls = cn(
    "group inline-flex items-center gap-2 whitespace-nowrap text-[15px] font-medium transition-[background-color,color,transform] duration-200",
    variant === "primary" &&
      "rounded-md bg-bordeaux px-5 py-3 text-white hover:bg-bordeaux-soft active:translate-y-px active:scale-[0.98]",
    variant === "link" && "py-3 text-ink hover:text-accent [&>.label]:underline [&>.label]:decoration-ink/25 [&>.label]:underline-offset-[6px] hover:[&>.label]:decoration-accent",
    className,
  );
  const arrow = (
    <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">
      {external ? "↗" : "→"}
    </span>
  );
  if (external || href.startsWith("mailto:")) {
    return (
      <a className={cls} href={href} {...(href.startsWith("mailto:") ? {} : { target: "_blank", rel: "noopener noreferrer" })}>
        <span className="label">{children}</span>
        {arrow}
        {!href.startsWith("mailto:") && <span className="sr-only"> {u.newTab}</span>}
      </a>
    );
  }
  return (
    <Link className={cls} href={href}>
      <span className="label">{children}</span>
      {arrow}
    </Link>
  );
}

"use client";
import { cn } from "@/lib/utils";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import React, { useState } from "react";

// Componente "Resizable Navbar" di Aceternity UI, adattato al portfolio: una barra sottile a tutta larghezza (una riga,
// 64 px), trasparente in cima alla pagina e con fondo sfocato e filo sotto appena si scorre. Link Next.js con voce attiva.

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface NavItemsProps {
  items: { name: string; link: string }[];
  className?: string;
  onItemClick?: () => void;
  label?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Navbar = ({ children, className }: NavbarProps) => {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  // in home il viaggio ha un cielo chiaro anche col tema scuro: la barra tiene il fondo da subito, per restare leggibile
  const path = usePathname();
  const solid = scrolled || path === "/" || path === "/en";

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 24);
  });

  return (
    <div
      className={cn(
        "fixed inset-x-0 top-0 z-50 w-full border-b transition-[background-color,border-color] duration-300",
        solid ? "border-line bg-paper/85 backdrop-blur-md" : "border-transparent",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const NavBody = ({ children, className }: NavBodyProps) => {
  return (
    <div
      className={cn(
        "relative z-[60] mx-auto hidden h-16 w-full max-w-[1240px] flex-row items-center justify-between px-8 lg:flex",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const NavItems = ({ items, className, onItemClick, label }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const pathname = usePathname();

  return (
    <nav
      aria-label={label}
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "pointer-events-none absolute inset-0 hidden flex-1 flex-row items-center justify-center gap-1 text-[15px] font-medium lg:flex",
        className,
      )}
    >
      {items.map((item, idx) => {
        const active = item.link === "/" || item.link === "/en" ? pathname === item.link : pathname.startsWith(item.link);
        return (
          <Link
            onMouseEnter={() => setHovered(idx)}
            onClick={onItemClick}
            className={cn(
              "pointer-events-auto relative px-4 py-2 transition-colors",
              active ? "text-ink" : "text-ink-soft hover:text-ink",
            )}
            key={`link-${idx}`}
            href={item.link}
            aria-current={active ? "page" : undefined}
          >
            {hovered === idx && (
              <motion.div layoutId="nav-hovered" className="absolute inset-0 h-full w-full rounded-md bg-ink/[0.06]" />
            )}
            <span className="relative z-20">{item.name}</span>
            {active && <span className="absolute inset-x-4 -bottom-[13px] z-20 h-[2px] bg-accent" />}
          </Link>
        );
      })}
    </nav>
  );
};

export const MobileNav = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={cn("relative z-50 mx-auto flex h-14 w-full flex-col justify-center px-5 sm:px-8 lg:hidden", className)}>
      {children}
    </div>
  );
};

export const MobileNavHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={cn("flex w-full flex-row items-center justify-between", className)}>{children}</div>;
};

export const MobileNavMenu = ({ children, className, isOpen }: MobileNavMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className={cn(
            "absolute inset-x-0 top-14 z-50 flex w-full flex-col items-start justify-start gap-5 border-b border-line bg-paper px-5 pb-7 pt-4 sm:px-8",
            className,
          )}
          style={{ boxShadow: "0 24px 48px -24px color-mix(in oklab, var(--ink) 30%, transparent)" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({
  isOpen,
  onClick,
  label = "Menu",
}: {
  isOpen: boolean;
  onClick: () => void;
  label?: string;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-expanded={isOpen}
      className="-mr-2 flex h-11 w-11 items-center justify-center rounded-md text-ink"
    >
      {isOpen ? <IconX size={22} /> : <IconMenu2 size={22} />}
    </button>
  );
};

export const NavbarLogo = ({ href = "/", label = "Vittoria Bassi" }: { href?: string; label?: string }) => {
  return (
    <Link href={href} aria-label={label} className="relative z-20 font-display text-[19px] font-bold tracking-[-0.03em] text-ink">
      Vittoria Bassi
    </Link>
  );
};

export const NavbarButton = ({
  href,
  children,
  className,
  ...props
}: {
  href?: string;
  children: React.ReactNode;
  className?: string;
} & React.ComponentPropsWithoutRef<"a">) => {
  return (
    <a
      href={href || undefined}
      className={cn(
        "relative inline-block cursor-pointer rounded-md border border-ink/20 px-3.5 py-1.5 text-center text-[14px] font-medium text-ink transition-colors duration-200 hover:border-ink hover:bg-ink hover:text-paper",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
};

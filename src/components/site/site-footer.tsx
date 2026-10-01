import { Wrap } from "@/components/site/primitives";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <Wrap className="flex flex-wrap items-center justify-between gap-3 py-8 text-[14px] text-ink-soft">
        <p>Made by me :)</p>
        <p className="tabular">© 2026 Vittoria Bassi</p>
      </Wrap>
    </footer>
  );
}

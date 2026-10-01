import { ArchiveView } from "@/components/archive/archive-view";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("en", "archive");

export default function Page() {
  return <ArchiveView />;
}

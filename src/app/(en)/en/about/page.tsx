import { AboutView } from "@/components/about/about-view";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("en", "about");

export default function Page() {
  return <AboutView />;
}

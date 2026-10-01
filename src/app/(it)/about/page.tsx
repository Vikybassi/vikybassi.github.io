import { AboutView } from "@/components/about/about-view";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("it", "about");

export default function Page() {
  return <AboutView />;
}

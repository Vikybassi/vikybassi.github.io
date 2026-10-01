import { HomeView } from "@/components/home/home-view";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("it", "home");

export default function Page() {
  return <HomeView />;
}

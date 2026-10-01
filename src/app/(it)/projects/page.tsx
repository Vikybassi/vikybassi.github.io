import { ProjectsView } from "@/components/projects/projects-view";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("it", "projects");

export default function Page() {
  return <ProjectsView />;
}

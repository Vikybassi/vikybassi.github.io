import { ResumeView } from "@/components/resume/resume-view";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("en", "resume");

export default function Page() {
  return <ResumeView />;
}

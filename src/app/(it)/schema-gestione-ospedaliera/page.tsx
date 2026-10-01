import { SchemaView } from "@/components/schema/schema-view";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("it", "schema");

export default function Page() {
  return <SchemaView />;
}

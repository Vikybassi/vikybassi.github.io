import { SchemaView } from "@/components/schema/schema-view";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("en", "schema");

export default function Page() {
  return <SchemaView />;
}

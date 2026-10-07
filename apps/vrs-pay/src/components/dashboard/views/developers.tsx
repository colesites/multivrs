import { PageHeader } from "../ui";
import { ApiKeys } from "./api-keys";
import { Webhooks } from "./webhooks";

export function DevelopersView() {
  return (
    <div className="grid gap-6">
      <PageHeader
        serif="Developers"
        title=""
        description="Keys for the API and SDKs, and where to send your webhooks."
      />
      <ApiKeys />
      <Webhooks />
    </div>
  );
}

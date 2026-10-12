import { highlight } from "@/lib/highlight";
import { useApi, useDashboard } from "../context";
import { CopyButton } from "../copy-button";
import type { ApiKey, List } from "../types";
import { Card, PageHeader } from "../ui";
import { ApiKeys, KeyValue } from "./api-keys";
import { Webhooks } from "./webhooks";

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1 border-t border-line py-3 first:border-t-0 sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-center sm:gap-4">
      <span className="text-xs font-medium text-mute">{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function Snippet({ code }: { code: string }) {
  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-xl bg-[#0d0d15] p-4 pr-12 font-mono text-[12px] leading-[1.7] text-[#e4e4ec]">
        <code>{highlight(code)}</code>
      </pre>
      <div className="absolute top-2 right-2 rounded-md bg-white/90">
        <CopyButton value={code} label="Copy code" />
      </div>
    </div>
  );
}

/** Everything needed to make a first test call, using this account's own keys. */
function Quickstart({ keys }: { keys: ApiKey[] }) {
  const { apiUrl } = useDashboard();
  const live = keys.filter((k) => !k.revoked);
  const publishable = live.find((k) => k.kind === "publishable");
  const secret = live.find((k) => k.kind === "secret");
  const setup = `import { VrsPay } from "@vrs-pay/sdk";

const vrs = new VrsPay(process.env.VRS_PAY_SECRET_KEY!, {
  apiUrl: "${apiUrl}",
});

const session = await vrs.checkout.sessions.create({
  amount: 4900,
  currency: "gbp",
  success_url: "https://your-app.com/thanks",
  cancel_url: "https://your-app.com/cart",
});`;

  return (
    <Card>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-ink">Quickstart</p>
        <a href="/docs" className="text-sm text-brand-600 hover:underline">
          Read the docs
        </a>
      </div>
      <p className="text-sm text-mute">
        Your test keys are ready. Nothing here charges real money.
      </p>
      <div className="mt-3">
        <Row label="API address">
          <span className="flex items-center gap-1">
            <code className="truncate font-mono text-xs text-ink">
              {apiUrl}
            </code>
            <CopyButton value={apiUrl} />
          </span>
        </Row>
        <Row label="Publishable key">
          {publishable ? (
            <KeyValue apiKey={publishable} />
          ) : (
            <span className="text-xs text-mute">None yet</span>
          )}
        </Row>
        <Row label="Secret key">
          {secret ? (
            <KeyValue apiKey={secret} />
          ) : (
            <span className="text-xs text-mute">None yet</span>
          )}
        </Row>
      </div>
      <div className="mt-3 grid gap-3">
        <Snippet code="bun add @vrs-pay/sdk" />
        <Snippet code={setup} />
      </div>
    </Card>
  );
}

export function DevelopersView() {
  const { session } = useDashboard();
  const { data, error, reload } = useApi<List<ApiKey>>("/keys");
  return (
    <div className="grid gap-6">
      <PageHeader
        serif="Developers"
        title=""
        description="Keys for the API and SDKs, and where to send your webhooks."
      />
      {session.mode === "test" && <Quickstart keys={data?.data ?? []} />}
      <ApiKeys data={data} error={error} reload={reload} />
      <Webhooks />
    </div>
  );
}

import { useState } from "react";
import { useAction } from "../context";
import { Button, Card, ErrorNote, Textarea } from "../ui";

const SAMPLE = `{
  "features": { "custom_domains": "boolean", "seats": "limit" },
  "plans": {
    "free": { "name": "Free", "features": { "seats": 1 } },
    "pro": {
      "name": "Pro",
      "trial_days": 14,
      "features": { "custom_domains": true, "seats": 5 },
      "prices": { "month": { "GBP": 900, "USD": 1000, "NGN": 1500000 } }
    }
  }
}`;

interface SyncResult {
  changed: boolean;
  created: string[];
  updated: string[];
  archived: string[];
}

/** Paste a billing config (the JSON form of vrs-pay.config.ts) and sync it. */
export function PlanSync({ onSynced }: { onSynced: () => void }) {
  const [config, setConfig] = useState(SAMPLE);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { run, pending } = useAction();

  async function sync() {
    setError(null);
    setResult(null);
    let body: object;
    try {
      body = JSON.parse(config);
    } catch {
      setError("That isn't valid JSON.");
      return;
    }
    const response = await run<SyncResult>("/v1/billing/sync", { body });
    if (response.error) setError(response.error);
    else if (response.data) {
      setResult(response.data);
      onSynced();
    }
  }

  return (
    <Card>
      <p className="text-sm font-medium text-ink">Sync plans</p>
      <p className="mt-1 text-sm text-mute">
        Prices in minor units (900 = £9.00). Running the same config twice
        changes nothing; a new amount becomes a new price, and plans you remove
        are archived, not deleted.
      </p>
      <Textarea
        value={config}
        onChange={(e) => setConfig(e.target.value)}
        spellCheck={false}
        aria-label="Billing config (JSON)"
        className="mt-4 h-64 rounded-xl border-line bg-[#0d0d15] p-4 font-mono text-[12.5px] leading-relaxed text-[#e4e4ec]"
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button type="button" disabled={pending} onClick={sync}>
          Sync plans
        </Button>
        {result && (
          <p className="text-sm text-ink-soft">
            {result.changed
              ? `${result.created.length} created · ${result.updated.length} updated · ${result.archived.length} archived`
              : "Already up to date."}
          </p>
        )}
      </div>
      {error && (
        <div className="mt-3">
          <ErrorNote message={error} />
        </div>
      )}
    </Card>
  );
}

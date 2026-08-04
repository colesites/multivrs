"use client";

import { Check, Clipboard, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiTokenList } from "@/features/dashboard/components/ApiTokenList";
import { createdApiTokenSchema } from "@/lib/schemas/api-token.schemas";
import type { ApiTokenSummary } from "@/lib/services/api-token.service";

type CreatedToken = ReturnType<typeof createdApiTokenSchema.parse>;

async function requestToken(name: string): Promise<CreatedToken | null> {
  try {
    const response = await fetch("/api/tokens", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) {
      toast.error("Token creation failed");
      return null;
    }
    return createdApiTokenSchema.parse(await response.json());
  } catch {
    toast.error("Token creation failed");
    return null;
  }
}

export function ApiTokensPage({
  embedded = false,
  initialTokens,
}: {
  embedded?: boolean;
  initialTokens: ApiTokenSummary[];
}) {
  const [tokens, setTokens] = useState(initialTokens);
  const [name, setName] = useState("My CLI");
  const [created, setCreated] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function createToken() {
    if (busy) return;
    setBusy(true);
    void requestToken(name).then((result) => {
      setBusy(false);
      if (result) {
        setTokens((current) => [result.apiToken, ...current]);
        setCreated(result.token);
      }
    });
  }

  async function revokeToken(id: string) {
    const response = await fetch(`/api/tokens/${id}`, { method: "DELETE" });
    if (!response.ok) return toast.error("Token revocation failed");
    setTokens((current) => current.filter((token) => token.id !== id));
    toast.success("Token revoked");
  }

  async function copyToken() {
    if (!created) return;
    await navigator.clipboard.writeText(created);
    toast.success("Token copied");
  }

  return (
    <div className={embedded ? "" : "mx-auto w-full max-w-4xl space-y-7 px-5 py-8"}>
      {!embedded ? (
        <header className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Developer tokens</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage CLI access to your account.
            </p>
          </div>
        </header>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-(--hairline) bg-background/70">
        <div className="border-b border-(--hairline) px-5 py-4">
          <h2 className="text-sm font-semibold">Developer tokens</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Manage CLI access to your account.
          </p>
        </div>
        <div className="p-5">
          <div className="flex max-w-xl gap-2">
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={80}
            />
            <Button onClick={createToken} disabled={busy || !name.trim()}>
              <Plus className="mr-2 size-4" /> Create
            </Button>
          </div>
          {created ? (
            <div className="mt-5 flex max-w-2xl items-center gap-2 border border-emerald-500/30 bg-emerald-500/5 p-3">
              <Check className="size-4 shrink-0 text-emerald-500" />
              <code className="min-w-0 flex-1 overflow-x-auto text-xs">
                {created}
              </code>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyToken}
                title="Copy token"
              >
                <Clipboard className="size-4" />
              </Button>
            </div>
          ) : null}
        </div>
        <ApiTokenList tokens={tokens} onRevoke={(id) => void revokeToken(id)} />
      </section>
    </div>
  );
}

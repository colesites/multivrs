"use client";

import { Check, Clipboard, KeyRound, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ApiTokenSummary } from "@/lib/services/api-token.service";

interface CreatedToken {
  token: string;
  apiToken: ApiTokenSummary;
}

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
    return (await response.json()) as CreatedToken;
  } catch {
    toast.error("Token creation failed");
    return null;
  }
}

export function ApiTokensPage({ initialTokens }: { initialTokens: ApiTokenSummary[] }) {
  const [tokens, setTokens] = useState(initialTokens);
  const [name, setName] = useState("My CLI");
  const [created, setCreated] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function createToken() {
    setBusy(true);
    const result = await requestToken(name);
    setBusy(false);
    if (result) {
      setTokens((current) => [result.apiToken, ...current]);
      setCreated(result.token);
    }
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
    <div className="mx-auto max-w-[1000px] space-y-8 px-5 py-8">
      <header>
        <h1 className="text-2xl font-semibold">Developer tokens</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage CLI access to your account.</p>
      </header>

      <section className="border-y border-border py-6">
        <div className="flex max-w-xl gap-2">
          <Input value={name} onChange={(event) => setName(event.target.value)} maxLength={80} />
          <Button onClick={createToken} disabled={busy || !name.trim()}>
            <Plus /> Create
          </Button>
        </div>
        {created ? (
          <div className="mt-5 flex max-w-2xl items-center gap-2 border border-emerald-500/30 bg-emerald-500/5 p-3">
            <Check className="size-4 shrink-0 text-emerald-500" />
            <code className="min-w-0 flex-1 overflow-x-auto text-xs">{created}</code>
            <Button variant="ghost" size="icon" onClick={copyToken} title="Copy token">
              <Clipboard />
            </Button>
          </div>
        ) : null}
      </section>

      <section className="divide-y divide-border border-y border-border">
        {tokens.length === 0 ? (
          <div className="flex items-center gap-3 py-8 text-sm text-muted-foreground">
            <KeyRound className="size-5" /> No developer tokens
          </div>
        ) : (
          tokens.map((token) => (
            <div key={token.id} className="flex items-center gap-4 py-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{token.name}</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">{token.hint}</p>
              </div>
              <span className="hidden text-xs text-muted-foreground sm:block">
                {token.lastUsedAt
                  ? `Used ${new Date(token.lastUsedAt).toLocaleDateString("en-US", { timeZone: "UTC" })}`
                  : "Never used"}
              </span>
              <Button variant="ghost" size="icon" onClick={() => revokeToken(token.id)} title="Revoke token">
                <Trash2 />
              </Button>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

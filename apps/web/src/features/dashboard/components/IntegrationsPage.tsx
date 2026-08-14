"use client";

import { Copy, KeyRound, PlugZap } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestOk } from "@/lib/api/request.client";
import { oidcTokenResponseSchema } from "@/lib/schemas/oidc.schemas";

type TokenState = "idle" | "loading" | "success" | "error";

export function IntegrationsPage({
  issuer,
  projectId,
  projectName,
}: {
  issuer: string;
  projectId: string;
  projectName: string;
}) {
  const [audience, setAudience] = useState("multivrs");
  const [token, setToken] = useState("");
  const [state, setState] = useState<TokenState>("idle");
  function generateToken() {
    if (state === "loading") return;
    setState("loading");
    void requestOk(
      `/api/projects/${projectId}/oidc/token`,
      {
        body: JSON.stringify({ audience }),
        headers: { "content-type": "application/json" },
        method: "POST",
      },
      "Token generation failed",
    )
      .then((response) => response.json())
      .then((body) => oidcTokenResponseSchema.parse(body))
      .then((result) => {
        setToken(result.token);
        setState("success");
      })
      .catch(() => setState("error"));
  }
  async function copyToken() {
    await navigator.clipboard.writeText(token);
  }
  return (
    <div className="mx-auto w-full max-w-5xl space-y-7 px-5 py-8">
      <header>
        <p className="font-geist-mono text-[10px] uppercase tracking-[0.16em] text-purple-400">
          Cloud identity
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Integrations
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Short-lived OIDC identity for {projectName} and its deployments.
        </p>
      </header>
      <section className="overflow-hidden rounded-2xl border border-[var(--hairline)] bg-background/70">
        <div className="flex items-start gap-4 border-b border-[var(--hairline)] p-5">
          <div className="grid size-10 place-items-center rounded-xl border border-purple-400/20 bg-purple-400/[0.06]">
            <PlugZap className="size-5 text-purple-300" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">OpenID Connect</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Exchange signed project identity for AWS, GCP, Azure, or another
              trust provider without long-lived cloud secrets.
            </p>
          </div>
        </div>
        <div className="grid gap-5 p-5">
          <label
            htmlFor="oidc-issuer"
            className="space-y-2 text-xs text-muted-foreground"
          >
            <span>Issuer</span>
            <Input id="oidc-issuer" readOnly value={issuer} />
          </label>
          <label
            htmlFor="oidc-audience"
            className="space-y-2 text-xs text-muted-foreground"
          >
            <span>Audience</span>
            <Input
              id="oidc-audience"
              value={audience}
              onChange={(event) => setAudience(event.target.value)}
            />
          </label>
          <div>
            <Button disabled={state === "loading"} onClick={generateToken}>
              <KeyRound className="size-4" />
              {state === "loading" ? "Generating…" : "Generate test token"}
            </Button>
          </div>
          {token && (
            <div className="relative rounded-xl border border-[var(--hairline)] bg-black/30 p-4 pr-12">
              <code className="block max-h-28 overflow-auto break-all text-[10px] leading-5 text-muted-foreground">
                {token}
              </code>
              <Button
                aria-label="Copy token"
                className="absolute right-2 top-2"
                onClick={copyToken}
                size="icon"
                variant="ghost"
              >
                <Copy className="size-4" />
              </Button>
            </div>
          )}
          {state === "error" && (
            <p className="text-xs text-rose-400">
              Token generation failed. Configure the OIDC signing key and public
              app URL.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

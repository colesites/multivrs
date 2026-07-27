"use client";

import { Box, Play, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestOk } from "@/lib/api/request.client";
import {
  sandboxCommandResponseSchema,
  sandboxCreateResponseSchema,
} from "@/lib/schemas/sandbox.schemas";

type SandboxState = "idle" | "creating" | "ready" | "running" | "error";

export function SandboxesPage({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const [sandboxId, setSandboxId] = useState<string>();
  const [command, setCommand] = useState("pwd && ls -la");
  const [output, setOutput] = useState("");
  const [state, setState] = useState<SandboxState>("idle");
  function create() {
    if (state === "creating") return;
    setState("creating");
    void requestOk(
      `/api/projects/${projectId}/sandboxes`,
      { method: "POST" },
      "Sandbox creation failed",
    )
      .then((response) => response.json())
      .then((body) => sandboxCreateResponseSchema.parse(body))
      .then((result) => {
        setSandboxId(result.sandboxId);
        setState("ready");
      })
      .catch(() => setState("error"));
  }
  function run() {
    if (!sandboxId || state === "running") return;
    setState("running");
    void requestOk(
      `/api/projects/${projectId}/sandboxes/${sandboxId}`,
      {
        body: JSON.stringify({ command }),
        headers: { "content-type": "application/json" },
        method: "POST",
      },
      "Command failed",
    )
      .then((response) => response.json())
      .then((body) => sandboxCommandResponseSchema.parse(body))
      .then((result) => {
        setOutput([result.stdout, result.stderr].filter(Boolean).join("\n"));
        setState("ready");
      })
      .catch(() => setState("error"));
  }
  function destroy() {
    if (!sandboxId) return;
    void requestOk(
      `/api/projects/${projectId}/sandboxes/${sandboxId}`,
      { method: "DELETE" },
      "Destroy failed",
    )
      .then(() => {
        setSandboxId(undefined);
        setOutput("");
        setState("idle");
      })
      .catch(() => setState("error"));
  }
  return (
    <div className="mx-auto w-full max-w-5xl space-y-7 px-5 py-8">
      <header>
        <p className="font-geist-mono text-[10px] uppercase tracking-[0.16em] text-blue-400">
          Isolated compute
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Sandboxes
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ephemeral Cloudflare container for {projectName}.
        </p>
      </header>
      <section className="overflow-hidden rounded-2xl border border-[var(--hairline)] bg-background/70">
        <div className="flex items-center justify-between gap-5 border-b border-[var(--hairline)] p-5">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl border border-blue-400/20 bg-blue-400/[0.06]">
              <Box className="size-4 text-blue-300" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Development sandbox</h2>
              <p className="mt-1 font-geist-mono text-[10px] text-muted-foreground">
                {sandboxId ?? "Not running"}
              </p>
            </div>
          </div>
          {sandboxId ? (
            <Button onClick={destroy} variant="outline">
              <Trash2 className="size-4" />
              Destroy
            </Button>
          ) : (
            <Button disabled={state === "creating"} onClick={create}>
              {state === "creating" ? "Starting…" : "Create sandbox"}
            </Button>
          )}
        </div>
        {sandboxId && (
          <div className="space-y-4 p-5">
            <div className="flex gap-3">
              <Input
                value={command}
                onChange={(event) => setCommand(event.target.value)}
                aria-label="Shell command"
              />
              <Button disabled={state === "running"} onClick={run}>
                <Play className="size-4" />
                {state === "running" ? "Running…" : "Run"}
              </Button>
            </div>
            <pre className="min-h-64 overflow-auto rounded-xl border border-[var(--hairline)] bg-black/50 p-4 font-geist-mono text-xs leading-5 text-emerald-300">
              {output || "$ Ready"}
            </pre>
          </div>
        )}
        {state === "error" && (
          <p className="border-t border-[var(--hairline)] px-5 py-3 text-xs text-rose-400">
            Sandbox request failed. Check the Cloudflare build worker
            configuration.
          </p>
        )}
      </section>
    </div>
  );
}

"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { EnvironmentTarget } from "@/features/dashboard/types/environment-variable.types";
import { requestOk } from "@/lib/api/request.client";

const TARGETS: EnvironmentTarget[] = ["production", "preview", "development"];
type FormState = "idle" | "saving" | "success" | "error";

export function EnvironmentVariableForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [targets, setTargets] = useState<EnvironmentTarget[]>([
    "production",
    "preview",
  ]);
  const [state, setState] = useState<FormState>("idle");

  function toggleTarget(target: EnvironmentTarget, checked: boolean) {
    setTargets((current) =>
      checked
        ? [...new Set([...current, target])]
        : current.filter((item) => item !== target),
    );
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "saving") return;
    setState("saving");
    void requestOk(
      `/api/projects/${projectId}/environment`,
      {
        body: JSON.stringify({ key, targets, value }),
        headers: { "content-type": "application/json" },
        method: "POST",
      },
      "Variable could not be saved",
    )
      .then(() => {
        setKey("");
        setValue("");
        setState("success");
        router.refresh();
      })
      .catch(() => setState("error"));
  }

  return (
    <form
      onSubmit={submit}
      className="grid gap-4 border-b border-[var(--hairline)] bg-white/[0.015] p-5 lg:grid-cols-[1fr_1.5fr_auto]"
    >
      <Input
        aria-label="Variable name"
        value={key}
        onChange={(event) => setKey(event.target.value.toUpperCase())}
        placeholder="DATABASE_URL"
        required
      />
      <Input
        aria-label="Variable value"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Encrypted value"
        required
        type="password"
      />
      <Button disabled={state === "saving" || !targets.length} type="submit">
        <Plus className="size-4" />
        {state === "saving" ? "Saving…" : "Save variable"}
      </Button>
      <div className="flex flex-wrap gap-5 lg:col-span-3">
        {TARGETS.map((target) => (
          <div
            key={target}
            className="flex items-center gap-2 text-xs capitalize text-muted-foreground"
          >
            <Checkbox
              aria-label={`${target} environment`}
              checked={targets.includes(target)}
              onCheckedChange={(checked) =>
                toggleTarget(target, checked === true)
              }
            />
            {target}
          </div>
        ))}
        {state === "success" && (
          <span className="text-xs text-emerald-400">
            Encrypted variable saved.
          </span>
        )}
        {state === "error" && (
          <span className="text-xs text-rose-400">
            Could not save the variable. Check the encryption key and try again.
          </span>
        )}
      </div>
    </form>
  );
}

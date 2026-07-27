"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EmailDomainOption } from "@/features/dashboard/types/email-route.types";
import { requestOk } from "@/lib/api/request.client";

type FormState = "idle" | "saving" | "success" | "error";

export function EmailRouteForm({
  domains,
  projectId,
}: {
  domains: EmailDomainOption[];
  projectId?: string;
}) {
  const router = useRouter();
  const [localPart, setLocalPart] = useState("");
  const [hostname, setHostname] = useState(domains[0]?.hostname ?? "");
  const [destination, setDestination] = useState("");
  const [state, setState] = useState<FormState>("idle");
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "saving") return;
    setState("saving");
    void requestOk(
      "/api/email-routes",
      {
        body: JSON.stringify({
          destination,
          projectId,
          source: `${localPart}@${hostname}`,
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      },
      "Route creation failed",
    )
      .then(() => {
        setLocalPart("");
        setDestination("");
        setState("success");
        router.refresh();
      })
      .catch(() => setState("error"));
  }
  return (
    <form
      onSubmit={submit}
      className="grid gap-4 border-b border-[var(--hairline)] bg-white/[0.015] p-5 lg:grid-cols-[1fr_1fr_1.3fr_auto]"
    >
      <Input
        aria-label="Address"
        value={localPart}
        onChange={(event) => setLocalPart(event.target.value.toLowerCase())}
        placeholder="hello"
        required
      />
      <Select value={hostname} onValueChange={setHostname}>
        <SelectTrigger>
          <SelectValue placeholder="Select domain" />
        </SelectTrigger>
        <SelectContent>
          {domains.map((domain) => (
            <SelectItem key={domain.hostname} value={domain.hostname}>
              @{domain.hostname}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        aria-label="Destination email"
        value={destination}
        onChange={(event) => setDestination(event.target.value)}
        placeholder="you@example.com"
        required
        type="email"
      />
      <Button disabled={state === "saving" || !hostname} type="submit">
        <Plus className="size-4" />
        {state === "saving" ? "Creating…" : "Create route"}
      </Button>
      {state === "success" && (
        <p className="text-xs text-emerald-400 lg:col-span-4">
          Email route created at Cloudflare.
        </p>
      )}
      {state === "error" && (
        <p className="text-xs text-rose-400 lg:col-span-4">
          Could not create the route. Verify the domain and Cloudflare token.
        </p>
      )}
    </form>
  );
}

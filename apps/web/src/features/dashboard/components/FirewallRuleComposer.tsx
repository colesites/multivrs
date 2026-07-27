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
import { requestOk } from "@/lib/api/request.client";

type SubmitState = "idle" | "submitting" | "success" | "error";

export function FirewallRuleComposer({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [state, setState] = useState<SubmitState>("idle");
  const [action, setAction] = useState("deny");
  const [conditionType, setConditionType] = useState("path");
  const [operator, setOperator] = useState("starts_with");

  function submit(formData: FormData) {
    if (state === "submitting") return;
    setState("submitting");
    void requestOk(
      `/api/projects/${projectId}/firewall`,
      {
        body: JSON.stringify({
          action,
          conditions: [
            { op: operator, type: conditionType, value: formData.get("value") },
          ],
          enabled: true,
          name: formData.get("name"),
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      },
      "Rule could not be created",
    )
      .then(() => {
        setState("success");
        router.refresh();
      })
      .catch(() => setState("error"));
  }

  return (
    <form
      action={submit}
      className="grid gap-3 border-y border-[var(--hairline)] bg-white/[0.015] p-4 lg:grid-cols-[1.2fr_.8fr_.8fr_1.2fr_auto]"
    >
      <Input name="name" required minLength={2} placeholder="Rule name" />
      <Select value={conditionType} onValueChange={setConditionType}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="path">Path</SelectItem>
          <SelectItem value="ip">IP address</SelectItem>
          <SelectItem value="country">Country</SelectItem>
          <SelectItem value="method">Method</SelectItem>
          <SelectItem value="user_agent">User agent</SelectItem>
        </SelectContent>
      </Select>
      <Select value={operator} onValueChange={setOperator}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="eq">Equals</SelectItem>
          <SelectItem value="contains">Contains</SelectItem>
          <SelectItem value="starts_with">Starts with</SelectItem>
          <SelectItem value="regex">Regex</SelectItem>
        </SelectContent>
      </Select>
      <Input name="value" required placeholder="/admin or NG" />
      <div className="flex gap-2">
        <Select value={action} onValueChange={setAction}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="deny">Block</SelectItem>
            <SelectItem value="allow">Allow</SelectItem>
            <SelectItem value="challenge">Challenge</SelectItem>
            <SelectItem value="rate_limit">Rate limit</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" disabled={state === "submitting"}>
          <Plus className="size-4" />
          {state === "submitting" ? "Adding" : "Add"}
        </Button>
      </div>
      {state === "error" && (
        <p className="text-xs text-rose-400 lg:col-span-5">
          The rule was not saved. Check the values and try again.
        </p>
      )}
      {state === "success" && (
        <p className="text-xs text-emerald-400 lg:col-span-5">
          Rule saved and queued for edge enforcement.
        </p>
      )}
    </form>
  );
}

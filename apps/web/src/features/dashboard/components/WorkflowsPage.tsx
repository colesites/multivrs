"use client";

import {
  Clock3,
  GitBranch,
  Globe2,
  Play,
  Plus,
  Timer,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  DashboardWorkflow,
  DashboardWorkflowStep,
} from "@/features/dashboard/types/platform-workflow.types";
import { requestOk } from "@/lib/api/request.client";

interface EditableStep extends DashboardWorkflowStep {
  clientId: string;
}

const workflowDateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export function WorkflowsPage({
  projectId,
  projectName,
  workflows,
}: {
  projectId: string;
  projectName: string;
  workflows: DashboardWorkflow[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [cron, setCron] = useState("");
  const [steps, setSteps] = useState<EditableStep[]>(() => [
    newHttpStep("initial-http"),
  ]);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function updateStep(clientId: string, update: Partial<EditableStep>) {
    setSteps((current) =>
      current.map((step) =>
        step.clientId === clientId ? { ...step, ...update } : step,
      ),
    );
  }

  function createWorkflow() {
    setMessage("");
    startTransition(async () => {
      try {
        await requestOk(
          `/api/projects/${projectId}/workflows`,
          {
            body: JSON.stringify({
              cron: cron.trim() || undefined,
              enabled: true,
              name,
              steps: steps.map(({ clientId: _clientId, ...step }) =>
                cleanStep(step),
              ),
            }),
            headers: { "content-type": "application/json" },
            method: "POST",
          },
          "Workflow creation failed",
        );
        setName("");
        setCron("");
        setSteps([newHttpStep()]);
        setMessage("Workflow created.");
        router.refresh();
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Workflow creation failed",
        );
      }
    });
  }

  function runWorkflow(workflowId: string) {
    setMessage("");
    startTransition(async () => {
      try {
        await requestOk(
          `/api/projects/${projectId}/workflows/${workflowId}/run`,
          {
            body: JSON.stringify({ input: { source: "dashboard" } }),
            headers: { "content-type": "application/json" },
            method: "POST",
          },
          "Workflow dispatch failed",
        );
        setMessage("Workflow queued.");
        router.refresh();
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Workflow dispatch failed",
        );
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-5 py-8">
      <header>
        <p className="font-geist-mono text-[10px] uppercase tracking-[0.16em] text-blue-400">
          Durable execution
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Workflows
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Durable steps and UTC schedules for {projectName}.
        </p>
      </header>

      <section className="border-y border-[var(--hairline)] py-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label
            className="space-y-2 text-xs text-muted-foreground"
            htmlFor="workflow-name"
          >
            Workflow name
            <Input
              id="workflow-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Daily sync"
            />
          </label>
          <label
            className="space-y-2 text-xs text-muted-foreground"
            htmlFor="workflow-cron"
          >
            UTC cron schedule{" "}
            <span className="text-muted-foreground/60">(optional)</span>
            <Input
              id="workflow-cron"
              value={cron}
              onChange={(event) => setCron(event.target.value)}
              placeholder="0 6 * * *"
            />
          </label>
        </div>
        <div className="mt-6 space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.clientId}
              className="grid gap-3 border-b border-[var(--hairline)] pb-5 md:grid-cols-[2rem_1fr_auto]"
            >
              <span className="pt-2 font-geist-mono text-xs text-muted-foreground">
                {index + 1}
              </span>
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  value={step.name}
                  onChange={(event) =>
                    updateStep(step.clientId, { name: event.target.value })
                  }
                  placeholder="Step name"
                />
                {step.type === "http" ? (
                  <Input
                    value={step.url ?? ""}
                    onChange={(event) =>
                      updateStep(step.clientId, { url: event.target.value })
                    }
                    placeholder="https://api.example.com/sync"
                    type="url"
                  />
                ) : (
                  <Input
                    value={step.durationSeconds ?? 60}
                    onChange={(event) =>
                      updateStep(step.clientId, {
                        durationSeconds: Number(event.target.value),
                      })
                    }
                    min={1}
                    max={2_592_000}
                    type="number"
                  />
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove step ${index + 1}`}
                disabled={steps.length === 1}
                onClick={() =>
                  setSteps((current) =>
                    current.filter((item) => item.clientId !== step.clientId),
                  )
                }
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setSteps((current) => [...current, newHttpStep()])}
          >
            <Globe2 className="size-4" /> HTTP step
          </Button>
          <Button
            variant="outline"
            onClick={() => setSteps((current) => [...current, newDelayStep()])}
          >
            <Timer className="size-4" /> Delay step
          </Button>
          <Button
            className="ml-auto"
            disabled={pending || !name.trim()}
            onClick={createWorkflow}
          >
            <Plus className="size-4" />{" "}
            {pending ? "Saving…" : "Create workflow"}
          </Button>
        </div>
        {message && (
          <p className="mt-4 text-xs text-muted-foreground">{message}</p>
        )}
      </section>

      <section aria-labelledby="workflow-list-title">
        <div className="mb-3 flex items-center justify-between border-b border-[var(--hairline)] pb-3">
          <h2
            id="workflow-list-title"
            className="font-geist-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
          >
            Project workflows
          </h2>
          <span className="font-geist-mono text-[10px] text-muted-foreground/60">
            {workflows.length} configured
          </span>
        </div>
        {workflows.map((workflow) => {
          const latest = workflow.runs[0];
          const schedule = workflow.schedules[0];
          return (
            <article
              key={workflow.id}
              className="grid gap-4 border-b border-[var(--hairline)] px-3 py-5 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <GitBranch className="size-4 text-blue-400" />
                  <h3 className="font-medium">{workflow.name}</h3>
                </div>
                <p className="mt-2 font-geist-mono text-[10px] text-muted-foreground">
                  {workflow.steps.length} steps ·{" "}
                  {schedule ? schedule.expression : "manual trigger"}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                {latest ? (
                  <span className="capitalize">Latest: {latest.status}</span>
                ) : (
                  <span>Never run</span>
                )}
                {schedule && (
                  <span className="mt-1 flex items-center gap-1 font-geist-mono text-[10px]">
                    <Clock3 className="size-3" />
                    {workflowDateFormatter.format(new Date(schedule.nextRunAt))}{" "}
                    UTC
                  </span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={pending}
                onClick={() => runWorkflow(workflow.id)}
              >
                <Play className="size-3.5" /> Run
              </Button>
            </article>
          );
        })}
        {!workflows.length && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No workflows yet.
          </p>
        )}
      </section>
    </div>
  );
}

function newHttpStep(clientId = crypto.randomUUID()): EditableStep {
  return {
    clientId,
    headers: {},
    method: "POST",
    name: "HTTP request",
    retries: 2,
    timeoutSeconds: 30,
    type: "http",
    url: "",
  };
}

function newDelayStep(): EditableStep {
  return {
    clientId: crypto.randomUUID(),
    durationSeconds: 60,
    name: "Wait",
    type: "delay",
  };
}

function cleanStep(step: DashboardWorkflowStep): DashboardWorkflowStep {
  return step.type === "delay"
    ? { durationSeconds: step.durationSeconds, name: step.name, type: "delay" }
    : {
        body: step.body,
        headers: step.headers ?? {},
        method: step.method ?? "POST",
        name: step.name,
        retries: step.retries ?? 2,
        timeoutSeconds: step.timeoutSeconds ?? 30,
        type: "http",
        url: step.url,
      };
}

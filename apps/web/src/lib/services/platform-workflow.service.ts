import "server-only";
import {
  ConfigurationError,
  NotFoundError,
  ValidationError,
} from "@multivrs/error-utils";
import { Prisma } from "@prisma/client";
import type { DashboardWorkflow } from "@/features/dashboard/types/platform-workflow.types";
import { prisma } from "@/lib/prisma";
import type {
  CreatePlatformWorkflowInput,
  PlatformWorkflowStep,
} from "@/lib/schemas/platform-workflow.schemas";
import { platformWorkflowStepSchema } from "@/lib/schemas/platform-workflow.schemas";
import { getProject, type ProjectAction } from "@/lib/services/project.service";
import { recordUsageEvent } from "@/lib/services/usage-event.service";

interface WorkflowDispatchPayload {
  input?: Prisma.JsonValue;
  projectId: string;
  runId: string;
  steps: PlatformWorkflowStep[];
  workflowId: string;
}

const CRON_FIELDS = [
  { maximum: 59, minimum: 0 },
  { maximum: 23, minimum: 0 },
  { maximum: 31, minimum: 1 },
  { maximum: 12, minimum: 1 },
  { maximum: 7, minimum: 0 },
] as const;

export async function listPlatformWorkflows(
  userId: string,
  projectId: string,
): Promise<DashboardWorkflow[]> {
  await requireOwnedProject(userId, projectId);
  const workflows = await prisma.platformWorkflow.findMany({
    where: { projectId },
    include: {
      schedules: { orderBy: { createdAt: "asc" } },
      runs: { orderBy: { createdAt: "desc" }, take: 10 },
    },
    orderBy: { createdAt: "desc" },
  });
  return workflows.map((workflow) => ({
    createdAt: workflow.createdAt.toISOString(),
    description: workflow.description,
    enabled: workflow.enabled,
    id: workflow.id,
    name: workflow.name,
    runs: workflow.runs.map((run) => ({
      createdAt: run.createdAt.toISOString(),
      id: run.id,
      status: run.status,
      trigger: run.trigger,
    })),
    schedules: workflow.schedules.map((schedule) => ({
      expression: schedule.expression,
      id: schedule.id,
      nextRunAt: schedule.nextRunAt.toISOString(),
    })),
    steps: parseSteps(workflow.steps),
  }));
}

export async function createPlatformWorkflow(
  userId: string,
  projectId: string,
  input: CreatePlatformWorkflowInput,
) {
  await requireOwnedProject(userId, projectId, "update");
  const nextRunAt = input.cron
    ? nextCronOccurrence(input.cron, new Date())
    : null;
  return prisma.platformWorkflow.create({
    data: {
      description: input.description,
      enabled: input.enabled,
      name: input.name,
      projectId,
      steps: input.steps,
      userId,
      schedules:
        input.cron && nextRunAt
          ? {
              create: {
                expression: input.cron,
                nextRunAt,
              },
            }
          : undefined,
    },
    include: { schedules: true },
  });
}

export async function runPlatformWorkflow(
  userId: string,
  projectId: string,
  workflowId: string,
  input?: Prisma.JsonValue,
) {
  await requireOwnedProject(userId, projectId, "deploy");
  const workflow = await prisma.platformWorkflow.findFirst({
    where: { id: workflowId, projectId },
  });
  if (!workflow) throw new NotFoundError("Workflow not found");
  if (!workflow.enabled) throw new ValidationError("Workflow is disabled");
  const steps = parseSteps(workflow.steps);
  const payloadBytes = serializedSize({ input, steps });
  const run = await prisma.platformWorkflowRun.create({
    data: {
      input: input === null ? Prisma.JsonNull : input,
      payloadBytes,
      projectId,
      trigger: "manual",
      workflowId,
    },
  });
  try {
    await dispatchPlatformWorkflow({
      input,
      projectId,
      runId: run.id,
      steps,
      workflowId,
    });
  } catch (error) {
    await prisma.platformWorkflowRun.update({
      where: { id: run.id },
      data: {
        errorMessage:
          error instanceof Error ? error.message : "Workflow dispatch failed",
        finishedAt: new Date(),
        status: "errored",
      },
    });
    throw error;
  }
  await recordUsageEvent(userId, projectId, "workflow_events", 1, {
    runId: run.id,
    trigger: "manual",
  });
  await recordUsageEvent(
    userId,
    projectId,
    "workflow_data_written_bytes",
    payloadBytes,
    {
      runId: run.id,
    },
  );
  return run;
}

export async function claimDuePlatformWorkflowRuns(limit = 100) {
  const now = new Date();
  return prisma.$transaction(async (tx) => {
    const due = await tx.platformWorkflowCron.findMany({
      where: {
        enabled: true,
        nextRunAt: { lte: now },
        workflow: { enabled: true },
      },
      include: { workflow: true },
      orderBy: { nextRunAt: "asc" },
      take: Math.min(Math.max(limit, 1), 100),
    });
    const runs = await Promise.all(
      due.map(async (schedule): Promise<WorkflowDispatchPayload | null> => {
        const nextRunAt = nextCronOccurrence(schedule.expression, now);
        const claimed = await tx.platformWorkflowCron.updateMany({
          where: { id: schedule.id, enabled: true, nextRunAt: { lte: now } },
          data: { lastRunAt: now, nextRunAt },
        });
        if (!claimed.count) return null;
        const steps = parseSteps(schedule.workflow.steps);
        const { projectId, userId } = schedule.workflow;
        const input: Prisma.JsonObject = {
          cron: schedule.expression,
          scheduledAt: schedule.nextRunAt.toISOString(),
        };
        const run = await tx.platformWorkflowRun.create({
          data: {
            input,
            payloadBytes: serializedSize({ input, steps }),
            projectId,
            trigger: "schedule",
            workflowId: schedule.workflowId,
          },
        });
        const payload = {
          input,
          projectId,
          runId: run.id,
          steps,
          workflowId: schedule.workflowId,
        } satisfies WorkflowDispatchPayload;
        await tx.usageEvent.createMany({
          data: [
            {
              metadata: { runId: run.id, trigger: "schedule" },
              metric: "workflow_events",
              projectId,
              quantity: 1,
              userId,
            },
            {
              metadata: { runId: run.id },
              metric: "workflow_data_written_bytes",
              projectId,
              quantity: run.payloadBytes,
              userId,
            },
          ],
        });
        return payload;
      }),
    );
    return runs.filter((run): run is WorkflowDispatchPayload => run !== null);
  });
}

export async function updatePlatformWorkflowRun(input: {
  errorMessage?: string;
  instanceId: string;
  output?: Prisma.JsonValue;
  runId: string;
  status: "running" | "complete" | "errored" | "terminated";
}) {
  const existing = await prisma.platformWorkflowRun.findUnique({
    where: { id: input.runId },
    include: { workflow: { select: { userId: true } } },
  });
  if (!existing) throw new NotFoundError("Workflow run not found");
  const outputBytes = serializedSize(input.output);
  const terminal = input.status !== "running";
  const run = await prisma.platformWorkflowRun.update({
    where: { id: input.runId },
    data: {
      cloudflareInstanceId: input.instanceId,
      errorMessage: input.errorMessage,
      finishedAt: terminal ? new Date() : undefined,
      output: input.output === null ? Prisma.JsonNull : input.output,
      outputBytes,
      startedAt: existing.startedAt ?? new Date(),
      status: input.status,
    },
  });
  if (terminal && outputBytes > 0) {
    await recordUsageEvent(
      existing.workflow.userId,
      existing.projectId,
      "workflow_data_written_bytes",
      outputBytes,
      { runId: existing.id },
    );
  }
  return run;
}

export function nextCronOccurrence(expression: string, after: Date): Date {
  const fields = expression.trim().split(/\s+/);
  if (fields.length !== CRON_FIELDS.length) {
    throw new ValidationError("Cron expressions must contain five fields");
  }
  const allowed = fields.map((field, index) => {
    const bounds = CRON_FIELDS[index];
    if (!bounds) throw new ValidationError("Invalid cron field");
    return parseCronField(
      field ?? "",
      bounds.minimum,
      bounds.maximum,
      index === 4,
    );
  });
  const candidate = new Date(after);
  candidate.setUTCSeconds(0, 0);
  candidate.setUTCMinutes(candidate.getUTCMinutes() + 1);
  const maxChecks = 60 * 24 * 366 * 2;
  for (let checked = 0; checked < maxChecks; checked += 1) {
    const dayOfWeek = candidate.getUTCDay();
    if (
      allowed[0]?.has(candidate.getUTCMinutes()) &&
      allowed[1]?.has(candidate.getUTCHours()) &&
      allowed[2]?.has(candidate.getUTCDate()) &&
      allowed[3]?.has(candidate.getUTCMonth() + 1) &&
      allowed[4]?.has(dayOfWeek)
    ) {
      return candidate;
    }
    candidate.setUTCMinutes(candidate.getUTCMinutes() + 1);
  }
  throw new ValidationError("Cron expression does not run within two years");
}

function parseCronField(
  field: string,
  minimum: number,
  maximum: number,
  sundayAlias: boolean,
): Set<number> {
  const values = new Set<number>();
  for (const part of field.split(",")) {
    const [rangeExpression = "", stepExpression] = part.split("/");
    const step = stepExpression ? Number(stepExpression) : 1;
    if (!Number.isInteger(step) || step < 1 || step > maximum - minimum + 1) {
      throw new ValidationError(`Invalid cron step: ${part}`);
    }
    let start = minimum;
    let end = maximum;
    if (rangeExpression !== "*") {
      const range = rangeExpression.split("-").map(Number);
      start = range[0] ?? Number.NaN;
      end = range.length === 1 ? start : (range[1] ?? Number.NaN);
      if (
        !Number.isInteger(start) ||
        !Number.isInteger(end) ||
        start < minimum ||
        end > maximum ||
        start > end
      ) {
        throw new ValidationError(`Invalid cron range: ${part}`);
      }
    }
    for (let value = start; value <= end; value += step) {
      values.add(sundayAlias && value === 7 ? 0 : value);
    }
  }
  return values;
}

function parseSteps(value: Prisma.JsonValue): PlatformWorkflowStep[] {
  return platformWorkflowStepSchema.array().parse(value);
}

function serializedSize(value: unknown): number {
  if (value === undefined) return 0;
  return new TextEncoder().encode(JSON.stringify(value)).byteLength;
}

async function requireOwnedProject(
  userId: string,
  projectId: string,
  action: ProjectAction = "read",
): Promise<void> {
  await getProject(userId, projectId, action);
}

async function dispatchPlatformWorkflow(
  payload: WorkflowDispatchPayload,
): Promise<void> {
  const workerUrl = process.env.CLOUDFLARE_WORKFLOW_WORKER_URL;
  const secret = process.env.MULTIVRS_WORKFLOW_CONTROL_SECRET;
  if (!workerUrl || !secret) {
    throw new ConfigurationError(
      "Workflows are not configured. Set CLOUDFLARE_WORKFLOW_WORKER_URL and MULTIVRS_WORKFLOW_CONTROL_SECRET.",
    );
  }
  const endpoint = new URL("/_multivrs/control/workflows", workerUrl);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      authorization: `Bearer ${secret}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Workflow worker returned ${response.status}`);
  }
}

import "server-only";
import type { DeploymentTarget } from "@multivrs/client";
import type { EnvironmentVariable } from "@prisma/client";
import type { z } from "zod";
import type {
  DashboardEnvironmentVariable,
  EnvironmentTarget,
} from "@/features/dashboard/types/environment-variable.types";
import { prisma } from "@/lib/prisma";
import type { saveEnvironmentVariableSchema } from "@/lib/schemas/environment-variable.schemas";
import {
  decryptEnvironmentValue,
  encryptEnvironmentValue,
} from "@/lib/services/environment-crypto.service";
import { getProject } from "@/lib/services/project.service";

type SaveInput = z.infer<typeof saveEnvironmentVariableSchema>;

function toDashboardVariable(
  row: EnvironmentVariable,
): DashboardEnvironmentVariable {
  return {
    id: row.id,
    key: row.key,
    targets: row.targets.filter(isTarget),
    updatedAt: row.updatedAt.toISOString(),
    value: "••••••••",
  };
}

function isTarget(value: string): value is EnvironmentTarget {
  return (
    value === "development" || value === "preview" || value === "production"
  );
}

export async function listEnvironmentVariables(
  userId: string,
  projectId: string,
) {
  await getProject(userId, projectId);
  const rows = await prisma.environmentVariable.findMany({
    where: { projectId },
    orderBy: { key: "asc" },
  });
  return rows.map(toDashboardVariable);
}

export async function saveEnvironmentVariable(
  userId: string,
  projectId: string,
  input: SaveInput,
) {
  await getProject(userId, projectId);
  const encrypted = encryptEnvironmentValue(input.value);
  const row = await prisma.environmentVariable.upsert({
    where: { projectId_key: { key: input.key, projectId } },
    create: { ...encrypted, key: input.key, projectId, targets: input.targets },
    update: { ...encrypted, targets: input.targets },
  });
  return toDashboardVariable(row);
}

export async function deleteEnvironmentVariable(
  userId: string,
  projectId: string,
  id: string,
) {
  await getProject(userId, projectId);
  await prisma.environmentVariable.deleteMany({ where: { id, projectId } });
}

export async function deploymentEnvironment(
  projectId: string,
  target: DeploymentTarget,
) {
  const rows = await prisma.environmentVariable.findMany({
    where: { projectId, targets: { has: target } },
  });
  return Object.fromEntries(
    rows.map((row) => [row.key, decryptEnvironmentValue(row)]),
  );
}

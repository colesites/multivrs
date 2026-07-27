import "server-only";
import { generateApiToken, hashApiToken, tokenHint } from "@/lib/api/api-token";
import { prisma } from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/services/audit-event.service";

export interface ApiTokenSummary {
  id: string;
  name: string;
  hint: string;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
}

function summary(token: {
  id: string;
  name: string;
  tokenHint: string;
  createdAt: Date;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
}): ApiTokenSummary {
  return {
    id: token.id,
    name: token.name,
    hint: token.tokenHint,
    createdAt: token.createdAt.toISOString(),
    lastUsedAt: token.lastUsedAt?.toISOString() ?? null,
    expiresAt: token.expiresAt?.toISOString() ?? null,
  };
}

export async function listApiTokens(
  userId: string,
): Promise<ApiTokenSummary[]> {
  const rows = await prisma.apiToken.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(summary);
}

export async function createApiToken(userId: string, name: string) {
  const token = generateApiToken();
  const row = await prisma.apiToken.create({
    data: {
      userId,
      name,
      tokenHash: hashApiToken(token),
      tokenHint: tokenHint(token),
    },
  });
  await recordAuditEvent({
    action: "api_token.created",
    entityId: row.id,
    entityType: "api_token",
    userId,
  });
  return { token, apiToken: summary(row) };
}

export async function revokeApiToken(
  userId: string,
  id: string,
): Promise<void> {
  await prisma.apiToken.deleteMany({ where: { id, userId } });
  await recordAuditEvent({
    action: "api_token.revoked",
    entityId: id,
    entityType: "api_token",
    userId,
  });
}

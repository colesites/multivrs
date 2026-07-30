import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function recordUsageEvent(
  userId: string | null,
  projectId: string | null,
  metric: string,
  quantity: bigint | number = 1,
  metadata?: Prisma.InputJsonValue,
): Promise<void> {
  await prisma.usageEvent.create({
    data: {
      metadata,
      metric,
      projectId,
      quantity: BigInt(quantity),
      userId,
    },
  });
}

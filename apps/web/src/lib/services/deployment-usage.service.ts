import "server-only";
import type { z } from "zod";
import type { deploymentUsageSchema } from "@/lib/schemas/deployment-usage.schemas";
import { getDeployment } from "@/lib/services/deployment.service";
import { recordUsageEvent } from "@/lib/services/usage-event.service";

type DeploymentUsageInput = z.infer<typeof deploymentUsageSchema>;

export async function recordDeploymentUsage(
  userId: string,
  projectId: string,
  deploymentId: string,
  input: DeploymentUsageInput,
): Promise<void> {
  await getDeployment(userId, projectId, deploymentId);
  await recordUsageEvent(userId, projectId, input.metric, input.quantity, {
    deploymentId,
  });
}

import "server-only";
import { ConfigurationError } from "@multivrs/error-utils";
import { createFirewallBypassToken } from "@multivrs/firewall";
import type { z } from "zod";
import type { createFirewallBypassSchema } from "@/lib/schemas/firewall-bypass.schemas";
import { recordAuditEvent } from "@/lib/services/audit-event.service";
import { getProject } from "@/lib/services/project.service";

type BypassInput = z.infer<typeof createFirewallBypassSchema>;

export async function issueFirewallBypass(
  userId: string,
  projectId: string,
  input: BypassInput,
): Promise<{ expiresAt: string; token: string }> {
  await getProject(userId, projectId, "update");
  const secret = process.env.MULTIVRS_FIREWALL_BYPASS_SECRET;
  if (!secret)
    throw new ConfigurationError("Firewall bypass signing is not configured");
  const expiresAt = new Date(Date.now() + input.ttlMinutes * 60_000);
  const token = await createFirewallBypassToken(
    {
      expiresAt: expiresAt.getTime(),
      pathPrefix: input.pathPrefix,
      projectId,
      subject: userId,
    },
    secret,
  );
  await recordAuditEvent({
    action: "firewall.bypass_issued",
    entityId: projectId,
    entityType: "project",
    projectId,
    userId,
  });
  return { expiresAt: expiresAt.toISOString(), token };
}

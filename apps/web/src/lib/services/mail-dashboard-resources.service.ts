import "server-only";
import { prisma } from "@/lib/prisma";
import { resource } from "@/lib/services/mail-dashboard-mappers";

export async function mailDashboardResources(
  userId: string,
  projectId?: string,
) {
  const scope = projectId ? { projectId } : {};
  const [
    domains,
    contacts,
    audiences,
    templates,
    broadcasts,
    automations,
    credentials,
    webhooks,
  ] = await Promise.all([
    prisma.mailDomain.findMany({
      where: { userId, ...scope },
      orderBy: { createdAt: "desc" },
    }),
    prisma.mailContact.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.mailAudience.findMany({
      where: { userId },
      include: { _count: { select: { members: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.mailTemplate.findMany({
      where: { userId, ...scope },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.mailBroadcast.findMany({
      where: { userId, ...scope },
      orderBy: { createdAt: "desc" },
    }),
    prisma.mailAutomation.findMany({
      where: { userId, ...scope },
      orderBy: { createdAt: "desc" },
    }),
    prisma.mailCredential.findMany({
      where: { userId, ...scope, revokedAt: null },
      orderBy: { createdAt: "desc" },
    }),
    prisma.mailWebhookEndpoint.findMany({
      where: { userId, ...scope },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return {
    verifiedDomains: domains.filter((item) => item.status === "verified")
      .length,
    resources: {
      domains: domains.map((item) =>
        resource(item.id, item.domain, item.kind, item.status, item.createdAt),
      ),
      contacts: contacts.map((item) =>
        resource(
          item.id,
          item.email,
          [item.firstName, item.lastName].filter(Boolean).join(" ") ||
            "Contact",
          item.status,
          item.createdAt,
        ),
      ),
      audiences: audiences.map((item) =>
        resource(
          item.id,
          item.name,
          `${item._count.members} contacts`,
          item.kind,
          item.createdAt,
        ),
      ),
      templates: templates.map((item) =>
        resource(
          item.id,
          item.name,
          `Version ${item.currentVersion}`,
          item.status,
          item.createdAt,
        ),
      ),
      broadcasts: broadcasts.map((item) =>
        resource(item.id, item.name, item.subject, item.status, item.createdAt),
      ),
      automations: automations.map((item) =>
        resource(
          item.id,
          item.name,
          `Version ${item.version}`,
          item.status,
          item.createdAt,
        ),
      ),
      credentials: credentials.map((item) =>
        resource(
          item.id,
          item.name,
          item.secretHint,
          `${item.mode} ${item.kind}`,
          item.createdAt,
        ),
      ),
      webhooks: webhooks.map((item) =>
        resource(
          item.id,
          item.url,
          `${item.events.length} events`,
          item.enabled ? "active" : "paused",
          item.createdAt,
        ),
      ),
    },
  };
}

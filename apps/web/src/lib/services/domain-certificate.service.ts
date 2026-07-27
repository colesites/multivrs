import "server-only";
import {
  addProviderRecord,
  getProviderDns,
} from "@/lib/domains/openprovider-dns";
import { prisma } from "@/lib/prisma";
import {
  deleteEdgeHostname,
  provisionEdgeHostname,
} from "@/lib/services/cloudflare-hostname.service";

export async function syncDomainCertificate(domainId: string): Promise<void> {
  const domain = await prisma.domain.findUnique({ where: { id: domainId } });
  if (!domain?.projectId || !domain.verified) return;
  const state = await provisionEdgeHostname(
    domain.hostname,
    domain.edgeHostnameId,
  );
  if (!state.configured) return;
  await prisma.domain.update({
    where: { id: domain.id },
    data: {
      certStatus: state.status,
      certVerificationName: state.verificationName ?? null,
      certVerificationValue: state.verificationValue ?? null,
      edgeHostnameId: state.id,
    },
  });
  if (domain.managed && state.verificationName && state.verificationValue) {
    await ensureValidationRecord(
      domain.hostname,
      state.verificationName,
      state.verificationValue,
    );
  }
}

export async function removeDomainCertificate(edgeHostnameId?: string | null) {
  if (edgeHostnameId) await deleteEdgeHostname(edgeHostnameId);
}

async function ensureValidationRecord(
  hostname: string,
  name: string,
  value: string,
) {
  const overview = await getProviderDns(hostname);
  const relativeName = name.endsWith(`.${hostname}`)
    ? name.slice(0, -(hostname.length + 1))
    : name;
  const exists = overview.records.some(
    (record) =>
      record.type === "TXT" &&
      record.name === relativeName &&
      record.value.includes(value),
  );
  if (!exists)
    await addProviderRecord(hostname, {
      name: relativeName,
      priority: null,
      ttl: 900,
      type: "TXT",
      value,
    });
}

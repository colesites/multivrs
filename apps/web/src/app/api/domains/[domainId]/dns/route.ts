import type { NextRequest } from "next/server";
import { parseBody } from "@/lib/api/parse-body";
import { fail, ok } from "@/lib/api/respond";
import { requireUserId } from "@/lib/api/session";
import {
  dnsRecordInputSchema,
  removeDnsRecordSchema,
  updateDnsRecordSchema,
} from "@/lib/domains/dns.schemas";
import {
  addDomainDnsRecord,
  getDomainDns,
  removeDomainDnsRecord,
  updateDomainDnsRecord,
} from "@/lib/services/domain-dns.service";


interface RouteParams {
  params: Promise<{ domainId: string }>;
}

export async function GET(_request: NextRequest, context: RouteParams) {
  return handle(context, (userId, domainId) => getDomainDns(userId, domainId));
}

export async function POST(request: NextRequest, context: RouteParams) {
  return handle(context, async (userId, domainId) => {
    const input = await parseBody(request, dnsRecordInputSchema);
    return addDomainDnsRecord(userId, domainId, input);
  });
}

export async function PATCH(request: NextRequest, context: RouteParams) {
  return handle(context, async (userId, domainId) => {
    const input = await parseBody(request, updateDnsRecordSchema);
    return updateDomainDnsRecord(userId, domainId, input);
  });
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  return handle(context, async (userId, domainId) => {
    const input = await parseBody(request, removeDnsRecordSchema);
    return removeDomainDnsRecord(userId, domainId, input.record);
  });
}

async function handle(
  context: RouteParams,
  operation: (userId: string, domainId: string) => Promise<unknown>,
) {
  try {
    const [userId, { domainId }] = await Promise.all([
      requireUserId(),
      context.params,
    ]);
    return ok(await operation(userId, domainId));
  } catch (error) {
    return fail(error);
  }
}

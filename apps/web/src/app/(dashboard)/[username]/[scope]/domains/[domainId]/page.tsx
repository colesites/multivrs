import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { DomainDnsPage } from "@/features/dashboard/components/DomainDnsPage";
import { auth } from "@/lib/auth";
import { getDomainDns } from "@/lib/services/domain-dns.service";
import { getDomainDetail } from "@/lib/services/domain-management.service";

export default async function DomainPage({
  params,
}: {
  params: Promise<{ username: string; scope: string; domainId: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) notFound();
  const { username, scope, domainId } = await params;
  let data: Awaited<ReturnType<typeof loadDomainPage>>;
  try {
    data = await loadDomainPage(session.user.id, domainId);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
  return (
    <DomainDnsPage
      domain={data.domain}
      initialOverview={data.overview}
      backUrl={`/${username}/${scope}/domains`}
    />
  );
}

async function loadDomainPage(userId: string, domainId: string) {
  const [domain, overview] = await Promise.all([
    getDomainDetail(userId, domainId),
    getDomainDns(userId, domainId),
  ]);
  return { domain, overview };
}

import { NotFoundError } from "@multivrs/error-utils";

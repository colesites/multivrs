import { NotFoundError } from "@multivrs/error-utils";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { DomainDnsPage } from "@/features/dashboard/components/DomainDnsPage";
import { auth } from "@/lib/auth";
import { domainProjectOptions } from "@/lib/services/domain.service";
import { getDomainDns } from "@/lib/services/domain-dns.service";
import { getDomainDetail } from "@/lib/services/domain-management.service";

export default async function DomainPage({
  params,
}: {
  params: Promise<{ username: string; scope: string; hostname: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) notFound();
  const { username, scope, hostname } = await params;
  let data: Awaited<ReturnType<typeof loadDomainPage>>;
  try {
    data = await loadDomainPage(session.user.id, hostname);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
  return (
    <DomainDnsPage
      domain={data.domain}
      initialOverview={data.overview}
      backUrl={`/${username}/${scope}/domains`}
      projects={data.projects}
    />
  );
}

async function loadDomainPage(userId: string, hostname: string) {
  const [domain, overview, projects] = await Promise.all([
    getDomainDetail(userId, hostname),
    getDomainDns(userId, hostname),
    domainProjectOptions(userId),
  ]);
  return { domain, overview, projects };
}

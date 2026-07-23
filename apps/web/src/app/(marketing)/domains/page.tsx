import type { Metadata } from "next";
import { headers } from "next/headers";
import { DomainMarketplace } from "@/features/domains/DomainMarketplace";
import { auth } from "@/lib/auth";
import { isOpenproviderSandbox } from "@/lib/domains/openprovider-client";
import { domainProjectOptions } from "@/lib/services/domain.service";

export const metadata: Metadata = {
  title: "Domains | Multivrs",
  description: "Find and manage a domain for your next project.",
};

export default async function DomainsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    teamSlug?: string;
    source?: string;
    checkout?: string;
  }>;
}) {
  const [params, requestHeaders] = await Promise.all([searchParams, headers()]);
  const { q = "", teamSlug, source, checkout } = params;
  const session = await auth.api.getSession({ headers: requestHeaders });
  const projects = session ? await domainProjectOptions(session.user.id) : [];
  return (
    <DomainMarketplace
      query={q}
      teamSlug={teamSlug ?? session?.user.username ?? undefined}
      source={source}
      projects={projects}
      sandboxEnabled={isOpenproviderSandbox()}
      openCheckout={checkout === "1"}
    />
  );
}

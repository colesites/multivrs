import type { Metadata } from "next";
import { headers } from "next/headers";
import { Suspense } from "react";
import { DomainMarketplace } from "@/features/domains/DomainMarketplace";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Domains | Multivrs",
  description: "Find and manage a domain for your next project.",
};

interface DomainsPageProps {
  searchParams: Promise<{
    q?: string;
    teamSlug?: string;
    projectSlug?: string;
    source?: string;
  }>;
}

export default function DomainsPage(props: DomainsPageProps) {
  return (
    <Suspense fallback={null}>
      <DomainsContent {...props} />
    </Suspense>
  );
}

async function DomainsContent({ searchParams }: DomainsPageProps) {
  const [params, requestHeaders] = await Promise.all([searchParams, headers()]);
  const { q = "", teamSlug, projectSlug, source } = params;
  const session = await auth.api.getSession({ headers: requestHeaders });
  return (
    <DomainMarketplace
      key={q}
      query={q}
      teamSlug={teamSlug ?? session?.user.username ?? undefined}
      projectSlug={projectSlug}
      source={source}
    />
  );
}

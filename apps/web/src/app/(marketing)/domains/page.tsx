import type { Metadata } from "next";
import { DomainMarketplace } from "@/features/domains/DomainMarketplace";

export const metadata: Metadata = {
  title: "Domains | Multivrs",
  description: "Find and manage a domain for your next project.",
};

export default async function DomainsPage({ searchParams }: { searchParams: Promise<{ q?: string; teamSlug?: string; source?: string }> }) {
  const { q = "", teamSlug, source } = await searchParams;
  return <DomainMarketplace query={q} teamSlug={teamSlug} source={source} />;
}

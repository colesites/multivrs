import type { Metadata } from "next";
import { Suspense } from "react";
import { DomainMarketplace } from "@/features/domains/DomainMarketplace";
import { DomainMarketplaceShell } from "@/features/domains/DomainMarketplaceShell";
import { DomainSearchPlaceholder } from "@/features/domains/DomainSearchPlaceholder";

export const metadata: Metadata = {
  title: "Domains | Multivrs",
  description: "Find and manage a domain for your next project.",
};

export default function DomainsPage() {
  return (
    <DomainMarketplaceShell>
      {/* Only the search experience reads the URL, so only it is suspended. */}
      <Suspense fallback={<DomainSearchPlaceholder />}>
        <DomainMarketplace />
      </Suspense>
    </DomainMarketplaceShell>
  );
}

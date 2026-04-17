import type { Metadata } from "next";
import { PageShell } from "@/components/marketing/PageShell";

export const metadata: Metadata = {
  title: "Resources",
  description: "Guides, documentation, tutorials, and engineering resources from Multivrs.",
};

export default function ResourcesPage() {
  return <PageShell title="Resources" description="Find implementation guides, documentation, migration playbooks, and practical tutorials." />;
}

import type { Metadata } from "next";
import { PageShell } from "@/components/marketing/PageShell";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join Multivrs and help build category-defining cloud and developer products.",
};

export default function CareersPage() {
  return <PageShell title="Careers" description="Build high-impact products with a team focused on developer velocity, quality, and reliability." />;
}

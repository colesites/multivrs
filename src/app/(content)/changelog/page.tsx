import type { Metadata } from "next";
import { PageShell } from "@/components/marketing/PageShell";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Track product updates, fixes, and feature releases across the Multivrs ecosystem.",
};

export default function ChangelogPage() {
  return <PageShell title="Changelog" description="Stay current with new features, performance improvements, and platform reliability updates." />;
}

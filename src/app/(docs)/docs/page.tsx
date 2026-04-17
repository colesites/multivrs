import type { Metadata } from "next";
import { PageShell } from "@/components/marketing/PageShell";

export const metadata: Metadata = {
  title: "Docs",
  description: "Official Multivrs documentation for onboarding, deployment, and advanced platform workflows.",
};

export default function DocsPage() {
  return <PageShell title="Documentation" description="Reference docs for setup, deployment, observability, security, and team operations." />;
}

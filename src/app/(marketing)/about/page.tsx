import type { Metadata } from "next";
import { PageShell } from "@/components/marketing/PageShell";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Multivrs, our mission, and the team building next-generation software infrastructure.",
};

export default function AboutPage() {
  return <PageShell title="About" description="Multivrs builds connected products for deployment, developer workflows, and AI-powered operations." />;
}

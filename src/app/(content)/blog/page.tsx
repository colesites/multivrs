import type { Metadata } from "next";
import { PageShell } from "@/components/marketing/PageShell";

export const metadata: Metadata = {
  title: "Blog",
  description: "Read Multivrs engineering insights on deployment, performance, AI, and developer workflows.",
};

export default function BlogPage() {
  return <PageShell title="Blog" description="Engineering deep-dives, launch stories, migration guides, and product updates from Multivrs." />;
}

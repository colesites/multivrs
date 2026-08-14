import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/marketing/ComingSoonPage";

export const metadata: Metadata = {
  title: "Documentation · Multivrs",
  description: "Comprehensive guides, API references, and quickstarts for the Multivrs platform.",
};

export default function DocsPage() {
  return <ComingSoonPage />;
}

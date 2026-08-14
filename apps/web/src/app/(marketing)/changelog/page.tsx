import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/marketing/ComingSoonPage";

export const metadata: Metadata = {
  title: "Changelog · Multivrs",
  description: "Recent product updates, new releases, and infrastructure improvements.",
};

export default function ChangelogPage() {
  return <ComingSoonPage />;
}

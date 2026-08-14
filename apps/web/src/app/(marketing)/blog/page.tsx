import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/marketing/ComingSoonPage";

export const metadata: Metadata = {
  title: "Blog · Multivrs",
  description: "Engineering deep-dives, product announcements, and cloud architecture guides.",
};

export default function BlogPage() {
  return <ComingSoonPage />;
}

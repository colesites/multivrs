import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/marketing/ComingSoonPage";

export const metadata: Metadata = {
  title: "About · Multivrs",
  description: "Building the next-generation sovereign cloud infrastructure platform.",
};

export default function AboutPage() {
  return <ComingSoonPage />;
}

import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/marketing/ComingSoonPage";

export const metadata: Metadata = {
  title: "Multivrs for Startups · Multivrs",
  description: "Cloud credits, architecture reviews, and high-performance infrastructure for early-stage startups.",
};

export default function StartupsPage() {
  return <ComingSoonPage />;
}

import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/marketing/ComingSoonPage";

export const metadata: Metadata = {
  title: "Shipped & Releases · Multivrs",
  description: "Live changelog and product releases shipped across Multivrs.",
};

export default function ShippedPage() {
  return <ComingSoonPage />;
}

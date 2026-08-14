import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/marketing/ComingSoonPage";

export const metadata: Metadata = {
  title: "Customers & Case Studies · Multivrs",
  description: "See how software teams build and scale global platforms on Multivrs.",
};

export default function CustomersPage() {
  return <ComingSoonPage />;
}

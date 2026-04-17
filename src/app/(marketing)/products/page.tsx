import type { Metadata } from "next";
import { PageShell } from "@/components/marketing/PageShell";

export const metadata: Metadata = {
  title: "Products",
  description: "Explore the Multivrs product ecosystem including Space, Kontinue AI, Present, EchoLive, and Nexus.",
};

export default function ProductsPage() {
  return <PageShell title="Products" description="Explore the Multivrs ecosystem: Space, Kontinue AI, Present, EchoLive, and supporting developer products." />;
}

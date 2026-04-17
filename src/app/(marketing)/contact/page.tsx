import type { Metadata } from "next";
import { PageShell } from "@/components/marketing/PageShell";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact the Multivrs team for sales, support, partnerships, and implementation questions.",
};

export default function ContactPage() {
  return <PageShell title="Contact" description="Talk to our team about product fit, migration planning, and enterprise requirements." />;
}

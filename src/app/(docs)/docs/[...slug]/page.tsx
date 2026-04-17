import type { Metadata } from "next";
import { PageShell } from "@/components/marketing/PageShell";

type DocsPageProps = { params: Promise<{ slug: string[] }> };

export async function generateMetadata({ params }: DocsPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Docs: ${slug.join(" / ")}`,
    description: "Multivrs documentation page.",
  };
}

export default async function DocsCatchAllPage({ params }: DocsPageProps) {
  const { slug } = await params;
  return <PageShell title={slug.join(" / ")} description="Docs article scaffold for product and API documentation." />;
}

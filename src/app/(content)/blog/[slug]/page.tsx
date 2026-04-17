import type { Metadata } from "next";
import { PageShell } from "@/components/marketing/PageShell";

type BlogPostPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Blog: ${slug.replace(/-/g, " ")}`,
    description: "Multivrs engineering article.",
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  return <PageShell title={slug.replace(/-/g, " ")} description="Article detail page scaffold for SEO-ready content." />;
}

import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { Suspense } from "react";
import { TemplateGridSkeleton } from "@/components/marketing/templates/TemplateGridSkeleton";
import { TemplateMarketplace } from "@/components/marketing/templates/TemplateMarketplace";
import { TemplatesHero } from "@/components/marketing/templates/TemplatesHero";
import type { MarketplaceTemplate } from "@/components/marketing/templates/template.types";
import { prisma } from "@/lib/prisma";
import { getDynamicFetchOptions } from "@/sanity/lib/live";
import {
  getPublishedTemplates,
  getTemplateCategories,
} from "@/sanity/lib/template.service";
import {
  getCachedTemplateCategories,
  getCachedTemplateContent,
  getCachedTemplateSellers,
  getCachedTemplateStats,
  type TemplateContent,
  type TemplateSeller,
  type TemplateStats,
} from "@/sanity/lib/template-cache";

export const metadata: Metadata = {
  title: "Templates",
  description:
    "Discover and sell production-ready templates made for the Multivrs ecosystem.",
  alternates: { canonical: "/templates" },
};

/**
 * The whole marketplace is dark, so it carries the `dark-marketing-header`
 * marker the navbar looks for. Without it the header renders its light-mode
 * styling over a black page, the same marker home, emails and domains use.
 */
export default function TemplatesMarketplacePage() {
  return (
    <main
      className="dark relative min-h-screen bg-black pt-16 text-white"
      id="dark-marketing-header"
    >
      {/* Covers the white page background when mobile rubber-bands at the top. */}
      <div className="absolute inset-x-0 bottom-full h-[50vh] bg-black" />
      <TemplatesHero />
      <Suspense fallback={<TemplateGridSkeleton />}>
        <TemplatesGrid />
      </Suspense>
    </main>
  );
}

async function TemplatesGrid() {
  const { isEnabled: isDraftMode } = await draftMode();
  return isDraftMode ? <DraftTemplatesGrid /> : <PublishedTemplatesGrid />;
}

/** The public marketplace, assembled from independently cached pieces. */
async function PublishedTemplatesGrid() {
  const [categoryDocs, content, stats] = await Promise.all([
    getCachedTemplateCategories(),
    getCachedTemplateContent(),
    getCachedTemplateStats(),
  ]);

  const sellerIds = uniqueSellerIds(content);
  const sellers = await getCachedTemplateSellers(sellerIds);

  return (
    <TemplateMarketplace
      categories={categoryDocs.map((category) => category.title)}
      templates={mergeTemplates(content, stats, sellers)}
    />
  );
}

/** Draft preview reads straight through, so editors always see current data. */
async function DraftTemplatesGrid() {
  const options = await getDynamicFetchOptions();
  const [categoryDocs, templates] = await Promise.all([
    getTemplateCategories(options),
    getPublishedTemplates(options),
  ]);

  const sellerIds = uniqueSellerIds(templates);
  const sellers = sellerIds.length
    ? await prisma.user.findMany({
        where: { id: { in: sellerIds } },
        select: { id: true, name: true, image: true, username: true },
      })
    : [];

  return (
    <TemplateMarketplace
      categories={categoryDocs.map((category) => category.title)}
      templates={mergeTemplates(
        templates,
        templates.map((template) => ({
          _id: template._id,
          likes: template.likes,
          views: template.views,
        })),
        sellers.map((seller) => ({
          id: seller.id,
          name: seller.name || seller.username || "Seller",
          image: seller.image,
          username: seller.username || undefined,
        })),
      )}
    />
  );
}

function uniqueSellerIds(templates: { sellerId?: string }[]): string[] {
  return Array.from(
    new Set(
      templates
        .map((template) => template.sellerId)
        .filter((id): id is string => typeof id === "string" && id.length > 0),
    ),
  );
}

function mergeTemplates(
  content: TemplateContent[],
  stats: TemplateStats[],
  sellers: TemplateSeller[],
): MarketplaceTemplate[] {
  const statsById = new Map(stats.map((item) => [item._id, item]));
  const sellersById = new Map(sellers.map((seller) => [seller.id, seller]));

  return content.map((template) => {
    const counters = statsById.get(template._id);
    const seller = template.sellerId
      ? sellersById.get(template.sellerId)
      : undefined;
    return {
      _id: template._id,
      name: template.name,
      description: template.description || "",
      category: template.category,
      stack: Array.isArray(template.stack) ? template.stack : [],
      price: template.price,
      previewUrl: template.previewUrl,
      imageUrl: template.imageUrl,
      likes: counters?.likes ?? 0,
      views: counters?.views ?? 0,
      seller: seller
        ? { name: seller.name, image: seller.image, username: seller.username }
        : null,
    };
  });
}

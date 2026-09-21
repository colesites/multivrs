import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { logWarning } from "@/lib/services/logger.service";
import { sanityFetch } from "./live";
import {
  publishedTemplateContentQuery,
  publishedTemplateStatsQuery,
  templateCategoriesQuery,
} from "./queries";
import type { TemplateCategory } from "./template.service";
import { resolveSanityImageUrl } from "./template.service";

/**
 * Cache tags for the templates marketplace.
 *
 * Content and counters are cached separately because they change on very
 * different rhythms: a seller edits a template rarely, while likes and views
 * move constantly. Sanity Live also tags every query made inside a `use cache`
 * boundary, so a newly published template still appears without waiting for
 * any of these lifetimes to lapse.
 */
export const TEMPLATE_CONTENT_TAG = "templates:content";
export const TEMPLATE_STATS_TAG = "templates:stats";
export const TEMPLATE_SELLERS_TAG = "templates:sellers";

export interface TemplateContent {
  _id: string;
  name: string;
  description: string;
  category: string;
  stack: string[];
  price: number;
  previewUrl: string;
  coverImage?: unknown;
  imageUrl?: string;
  sellerId?: string;
}

export interface TemplateStats {
  _id: string;
  likes?: number;
  views?: number;
}

export interface TemplateSeller {
  id: string;
  name: string;
  image: string | null;
  username?: string;
}

/**
 * Template content. Held until a seller's edit invalidates
 * `TEMPLATE_CONTENT_TAG` or Sanity Live reports the document changed.
 */
export async function getCachedTemplateContent(): Promise<TemplateContent[]> {
  "use cache";
  cacheLife("max");
  cacheTag(TEMPLATE_CONTENT_TAG);

  try {
    const { data } = await sanityFetch({
      query: publishedTemplateContentQuery,
      perspective: "published",
      stega: false,
    });
    const templates = Array.isArray(data) ? (data as TemplateContent[]) : [];
    return templates.map((template) => ({
      ...template,
      imageUrl: resolveSanityImageUrl(template.coverImage, template.imageUrl),
    }));
  } catch (error) {
    logWarning("sanity.template.content_fetch_failed", error);
    return [];
  }
}

/** Categories change about as rarely as content, so they share its lifetime. */
export async function getCachedTemplateCategories(): Promise<
  TemplateCategory[]
> {
  "use cache";
  cacheLife("max");
  cacheTag(TEMPLATE_CONTENT_TAG);

  try {
    const { data } = await sanityFetch({
      query: templateCategoriesQuery,
      perspective: "published",
      stega: false,
    });
    return Array.isArray(data) ? (data as TemplateCategory[]) : [];
  } catch (error) {
    logWarning("sanity.templateCategory.cached_fetch_failed", error);
    return [];
  }
}

/**
 * Like and view counters. They refresh once a day on their own, and right away
 * when a like or a view invalidates `TEMPLATE_STATS_TAG`.
 */
export async function getCachedTemplateStats(): Promise<TemplateStats[]> {
  "use cache";
  cacheLife("days");
  cacheTag(TEMPLATE_STATS_TAG);

  try {
    const { data } = await sanityFetch({
      query: publishedTemplateStatsQuery,
      perspective: "published",
      stega: false,
    });
    return Array.isArray(data) ? (data as TemplateStats[]) : [];
  } catch (error) {
    logWarning("sanity.template.stats_fetch_failed", error);
    return [];
  }
}

/** Seller profiles come from Postgres and change rarely. */
export async function getCachedTemplateSellers(
  sellerIds: string[],
): Promise<TemplateSeller[]> {
  "use cache";
  cacheLife("days");
  cacheTag(TEMPLATE_SELLERS_TAG);

  if (sellerIds.length === 0) return [];

  try {
    const sellers = await prisma.user.findMany({
      where: { id: { in: sellerIds } },
      select: {
        id: true,
        name: true,
        image: true,
        username: true,
        displayUsername: true,
      },
    });
    return sellers.map((seller) => ({
      id: seller.id,
      name:
        seller.name || seller.displayUsername || seller.username || "Seller",
      image: seller.image,
      username: seller.username || undefined,
    }));
  } catch (error) {
    logWarning("templates.sellers_fetch_failed", error);
    return [];
  }
}

import { logWarning } from "@/lib/services/logger.service";
import { type DynamicFetchOptions, sanityFetch } from "./live";
import {
  publishedTemplatesQuery,
  sellerTemplatesQuery,
  templateCategoriesQuery,
  templateStacksQuery,
} from "./queries";

export interface TemplateCategory {
  _id: string;
  title: string;
}

export interface TemplateStack {
  _id: string;
  name: string;
  iconUrl?: string;
}

export interface SanityTemplate {
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
  likes?: number;
  views?: number;
}

export async function getTemplateStacks(
  options: DynamicFetchOptions = { perspective: "published", stega: false },
): Promise<TemplateStack[]> {
  try {
    const { data } = await sanityFetch({
      query: templateStacksQuery,
      perspective: options.perspective,
      stega: options.stega,
    });
    return Array.isArray(data) ? (data as TemplateStack[]) : [];
  } catch (error) {
    logWarning("sanity.templateStack.fetch_failed", error);
    return [];
  }
}

export async function getTemplateCategories(
  options: DynamicFetchOptions = { perspective: "published", stega: false },
): Promise<TemplateCategory[]> {
  try {
    const { data } = await sanityFetch({
      query: templateCategoriesQuery,
      perspective: options.perspective,
      stega: options.stega,
    });
    return Array.isArray(data) ? (data as TemplateCategory[]) : [];
  } catch (error) {
    logWarning("sanity.templateCategory.fetch_failed", error);
    return [];
  }
}

export function resolveSanityImageUrl(
  coverImage?: unknown,
  explicitUrl?: string,
): string | undefined {
  if (explicitUrl) return explicitUrl;
  if (!coverImage || typeof coverImage !== "object") return undefined;
  const asset = (coverImage as { asset?: { _ref?: string; url?: string } })
    .asset;
  if (asset?.url) return asset.url;
  if (typeof asset?._ref === "string") {
    // Format: image-869da5db98a812658a72ba21dea8868cb8d8c581-3840x2400-png
    const parts = asset._ref.split("-");
    if (parts.length >= 4 && parts[0] === "image") {
      const assetId = parts[1];
      const dimensions = parts[2];
      const format = parts[3];
      const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "1vyq7p16";
      const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "development";
      return `https://cdn.sanity.io/images/${projectId}/${dataset}/${assetId}-${dimensions}.${format}`;
    }
  }
  return undefined;
}

export async function getPublishedTemplates(
  options: DynamicFetchOptions = { perspective: "published", stega: false },
): Promise<SanityTemplate[]> {
  try {
    const { data } = await sanityFetch({
      query: publishedTemplatesQuery,
      perspective: options.perspective,
      stega: options.stega,
    });
    const templates = Array.isArray(data) ? (data as SanityTemplate[]) : [];
    return templates.map((t) => ({
      ...t,
      imageUrl: resolveSanityImageUrl(t.coverImage, t.imageUrl),
    }));
  } catch (error) {
    logWarning("sanity.template.fetch_failed", error);
    return [];
  }
}

export interface SellerTemplate {
  _id: string;
  name?: string;
  description?: string;
  price?: number;
  status?: string;
  previewUrl?: string;
  githubRepository?: string;
  categoryId?: string;
  stackIds?: string[];
  stack?: string[];
  imageUrl?: string;
}

/**
 * Every template a seller owns, drafts and published alike, so they can
 * review, edit, or delete their own listings from the dashboard.
 */
export async function getSellerTemplates(
  sellerId: string,
): Promise<SellerTemplate[]> {
  try {
    const { data } = await sanityFetch({
      query: sellerTemplatesQuery,
      params: { sellerId },
      perspective: "published",
      stega: false,
    });
    return Array.isArray(data) ? (data as SellerTemplate[]) : [];
  } catch (error) {
    logWarning("sanity.template.seller_fetch_failed", error);
    return [];
  }
}

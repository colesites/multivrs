import { logWarning } from "@/lib/services/logger.service";
import { type DynamicFetchOptions, sanityFetch } from "./live";
import { faqsQuery } from "./queries";

export interface FaqItem {
  _id: string;
  question: string;
  answer: string;
  category?: string;
  page?: string;
  order?: number;
}

export async function getFaqs(
  page?: "home" | "pricing" | "all",
  options: DynamicFetchOptions = { perspective: "published", stega: false },
): Promise<FaqItem[]> {
  try {
    const { data } = await sanityFetch({
      query: faqsQuery,
      params: {
        page: page || "all",
      },
      perspective: options.perspective,
      stega: options.stega,
    });
    return Array.isArray(data) ? (data as FaqItem[]) : [];
  } catch (error) {
    logWarning("sanity.faq.fetch_failed", error);
    return [];
  }
}

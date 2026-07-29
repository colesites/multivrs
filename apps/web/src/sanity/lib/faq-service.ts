import { cacheLife, cacheTag } from "next/cache";
import { logWarning } from "@/lib/services/logger.service";
import { client } from "./client";
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
): Promise<FaqItem[]> {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 300 });
  cacheTag("faqs", `faqs-${page ?? "all"}`);

  try {
    const data = await client.fetch<FaqItem[]>(faqsQuery, {
      page: page || "all",
    });
    return data || [];
  } catch (error) {
    logWarning("sanity.faq.fetch_failed", error);
    return [];
  }
}

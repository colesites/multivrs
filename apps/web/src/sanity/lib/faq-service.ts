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
  try {
    const data = await client.fetch<FaqItem[]>(
      faqsQuery,
      { page: page || "all" },
      { next: { revalidate: 60 } },
    );
    return data || [];
  } catch (error) {
    logWarning("sanity.faq.fetch_failed", error);
    return [];
  }
}

import { getFaqs } from "@/sanity/lib/faq-service";
import { FaqSection } from "./FaqSection";

export async function FaqStream({ page }: { page: "home" | "pricing" }) {
  return <FaqSection faqs={await getFaqs(page)} />;
}

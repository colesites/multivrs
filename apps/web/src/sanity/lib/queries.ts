import { groq } from "next-sanity";

export const faqsQuery = groq`
  *[_type == "faq" && (!defined($page) || page == "all" || page == $page)] | order(order asc) {
    _id,
    question,
    answer,
    "category": category->title,
    page,
    order
  }
`;

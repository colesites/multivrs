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

export const pricingComparisonQuery = groq`
  *[_type == "pricingComparison"][0] {
    _id,
    _type,
    title,
    description,
    searchPlaceholder,
    plans[] {
      _key,
      _type,
      key,
      name,
      description
    },
    sections[] {
      _key,
      _type,
      slug,
      title,
      description,
      items[] {
        _key,
        _type,
        title,
        name,
        description,
        implementationStatus,
        values[] {
          _key,
          _type,
          planKey,
          kind,
          value,
          note
        },
        features[] {
          _key,
          _type,
          name,
          description,
          implementationStatus,
          values[] {
            _key,
            _type,
            planKey,
            kind,
            value,
            note
          }
        }
      }
    }
  }
`;

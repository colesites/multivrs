import { defineQuery } from "next-sanity";

export const faqsQuery = defineQuery(`
  *[_type == "faq" && (!defined($page) || page == "all" || page == $page)] | order(order asc) {
    _id,
    question,
    answer,
    "category": category->title,
    page,
    order
  }
`);

export const pricingComparisonQuery = defineQuery(`
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
`);

export const templateCategoriesQuery = defineQuery(`
  *[_type == "templateCategory"] | order(title asc) {
    _id,
    title
  }
`);

export const templateStacksQuery = defineQuery(`
  *[_type == "templateStack"] | order(name asc) {
    _id,
    name,
    "iconUrl": icon.asset->url
  }
`);

export const publishedTemplatesQuery = defineQuery(`
  *[_type == "template" && status == "published"] | order(_createdAt desc) {
    _id,
    name,
    description,
    "category": category->title,
    "stack": stack[]->name,
    price,
    previewUrl,
    coverImage,
    "imageUrl": coverImage.asset->url,
    sellerId,
    likes,
    views
  }
`);

/**
 * Everything about a published template except its counters. Cached for a long
 * time and refreshed only when a seller changes the document.
 */
export const publishedTemplateContentQuery = defineQuery(`
  *[_type == "template" && status == "published"] | order(_createdAt desc) {
    _id,
    name,
    description,
    "category": category->title,
    "stack": stack[]->name,
    price,
    previewUrl,
    coverImage,
    "imageUrl": coverImage.asset->url,
    sellerId
  }
`);

/** Just the like and view counters, which change far more often than content. */
export const publishedTemplateStatsQuery = defineQuery(`
  *[_type == "template" && status == "published"] {
    _id,
    likes,
    views
  }
`);

/**
 * Every real template belonging to one seller, at any review status.
 * Opening the composer creates an empty placeholder document, so listings that
 * were never named are left out.
 */
export const sellerTemplatesQuery = defineQuery(`
  *[_type == "template" && sellerId == $sellerId && defined(name) && name != ""] | order(_createdAt desc) {
    _id,
    name,
    description,
    price,
    status,
    previewUrl,
    githubRepository,
    "categoryId": category->_id,
    "stackIds": stack[]->_id,
    "stack": stack[]->name,
    "imageUrl": coverImage.asset->url
  }
`);

import { siteName, siteUrl } from "@/lib/site";

/** Signed-in and one-off pages that shouldn't appear in search results. */
const PRIVATE = [
  /^\/dashboard/,
  /^\/pay\//,
  /^\/paid/,
  /^\/forgot-password/,
  /^\/reset-password/,
];

/** How people type the name; helps search engines tie the queries to this site. */
const ALTERNATE_NAMES = ["VRS-Pay", "VRSPay", "VRS Pay Online"];

const HOME_STRUCTURED_DATA = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    alternateName: ALTERNATE_NAMES,
    url: siteUrl,
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    alternateName: ALTERNATE_NAMES,
    url: siteUrl,
    logo: `${siteUrl}/brand/vrs-pay-mark-512.png`,
    description:
      "Payments API for developers: cards, wallets and local payment methods, subscriptions and cross-border payouts.",
  },
];

/**
 * Per-page search metadata for every route (swift-rust's seo.tsx): each page
 * is its own canonical URL, private pages are kept out of the index, and the
 * homepage carries structured data naming the site.
 */
export default function seo({ url }: { url: URL }) {
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const canonical = path === "/" ? siteUrl : `${siteUrl}${path}`;
  if (PRIVATE.some((pattern) => pattern.test(path))) {
    return { canonical, robots: "noindex, follow" };
  }
  return {
    canonical,
    ...(path === "/" ? { jsonLd: HOME_STRUCTURED_DATA } : {}),
  };
}

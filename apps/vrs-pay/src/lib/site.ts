/**
 * Social cards need absolute https URLs. The page is prerendered at build
 * time, where Vercel exposes the production domain; set SITE_URL to override
 * it (e.g. once a custom domain is attached).
 */
export const siteUrl = (
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3210")
).replace(/\/+$/, "");

export const siteName = "VRS Pay";
export const siteTitle = "VRS Pay — Payment integration across every border";

/**
 * One 1200×630 JPEG serves X, LinkedIn, Facebook, WhatsApp, Instagram DMs,
 * Slack, iMessage and Discord. Keep it under 300 KB — WhatsApp drops larger
 * preview images — and keep text away from the edges, since X crops to ~2:1.
 */
export const ogImage = {
  url: `${siteUrl}/og-image.jpg`,
  width: 1200,
  height: 630,
  alt: "VRS Pay — Payment integration across every border",
};

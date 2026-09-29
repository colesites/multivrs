/**
 * The canonical production origin. Social crawlers need absolute https URLs,
 * and previews/local builds should still point shares at the real site, so
 * this is fixed rather than derived from the host. SITE_URL overrides it.
 */
export const siteUrl = (
  process.env.SITE_URL ?? "https://vrs-pay.multivrs.space"
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

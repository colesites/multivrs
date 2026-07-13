import type { MetadataRoute } from "next";
import { SITE_URL as BASE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "/home",
    "/about",
    "/contact",
    "/pricing",
    "/blog",
    "/agents",
    "cdn",
    "/domains",
    "/email",
    "fluid",
    "/help",
    "/legal",
    "/observability",
    "/plugin",
    "/security",
    "/shipped",
    "/startups",
  ];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}

import type { MetadataRoute } from "next";

const BASE_URL = "https://multivrs.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/products",
    "/pricing",
    "/resources",
    "/about",
    "/contact",
    "/blog",
    "/docs",
    "/changelog",
    "/careers",
  ];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}

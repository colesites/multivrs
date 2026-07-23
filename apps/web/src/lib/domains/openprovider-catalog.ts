import "server-only";
import {
  type CatalogEntry,
  catalogSchema,
} from "@/lib/domains/openprovider-search-record";

const PAGE_SIZE = 500;
const CATALOG_TTL_MS = 21_600_000;
let catalogCache: { expiresAt: number; entries: CatalogEntry[] } | null = null;
let catalogRequest: Promise<CatalogEntry[]> | null = null;

export async function getOpenproviderCatalog(
  baseUrl: string,
  token: string,
): Promise<CatalogEntry[]> {
  if (catalogCache && catalogCache.expiresAt >= Date.now()) {
    return catalogCache.entries;
  }
  if (!catalogRequest) catalogRequest = fetchCatalog(baseUrl, token);
  try {
    const entries = await catalogRequest;
    catalogCache = { entries, expiresAt: Date.now() + CATALOG_TTL_MS };
    return entries;
  } finally {
    catalogRequest = null;
  }
}

async function fetchCatalog(
  baseUrl: string,
  token: string,
): Promise<CatalogEntry[]> {
  const first = await fetchPage(baseUrl, token, 0);
  const offsets = Array.from(
    { length: Math.ceil(first.total / PAGE_SIZE) - 1 },
    (_, index) => (index + 1) * PAGE_SIZE,
  );
  const rest = await Promise.all(
    offsets.map((offset) => fetchPage(baseUrl, token, offset)),
  );
  return [...first.results, ...rest.flatMap((page) => page.results)]
    .filter((item) => item.status === "ACT")
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function fetchPage(baseUrl: string, token: string, offset: number) {
  const response = await fetch(
    `${baseUrl}/v1beta/tlds?limit=${PAGE_SIZE}&offset=${offset}&with_price=true`,
    {
      headers: { authorization: `Bearer ${token}` },
      next: { revalidate: 21_600 },
    },
  );
  if (!response.ok) {
    throw new Error(`Openprovider catalog failed (${response.status})`);
  }
  return catalogSchema.parse(await response.json()).data;
}

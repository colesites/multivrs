import "server-only";
import type { DomainSearchResult } from "@/features/domains/domain-marketplace";
import { getOpenproviderCatalog } from "@/lib/domains/openprovider-catalog";
import {
  getOpenproviderConfig,
  getOpenproviderToken,
  isLocalOpenproviderSandbox,
} from "@/lib/domains/openprovider-client";
import { searchLocalSandbox } from "@/lib/domains/local-sandbox-provider";
import {
  type CatalogEntry,
  parseDomainCheck,
} from "@/lib/domains/openprovider-search-record";

const DEFAULT_TLDS = [
  "com",
  "dev",
  "app",
  "io",
  "ai",
  "space",
  "cloud",
  "studio",
  "tech",
];
const CHECK_BATCH_SIZE = 12;

export async function searchOpenprovider(
  name: string,
): Promise<DomainSearchResult[] | null> {
  return searchOpenproviderExtensions(name, DEFAULT_TLDS);
}

export async function searchOpenproviderExtensions(
  name: string,
  extensions: string[],
): Promise<DomainSearchResult[] | null> {
  if (isLocalOpenproviderSandbox()) {
    return searchLocalSandbox(name, extensions);
  }
  const config = getOpenproviderConfig();
  if (!config) return null;
  const token = await getOpenproviderToken(config);
  return checkExtensions(config.baseUrl, token, name, extensions);
}

export async function searchOpenproviderCatalog(
  name: string,
  extensions: string[],
): Promise<{ catalog: string[]; results: DomainSearchResult[] } | null> {
  if (isLocalOpenproviderSandbox()) {
    return {
      catalog: [...DEFAULT_TLDS],
      results: await searchLocalSandbox(name, extensions),
    };
  }
  const config = getOpenproviderConfig();
  if (!config) return null;
  const token = await getOpenproviderToken(config);
  const catalog = await getOpenproviderCatalog(config.baseUrl, token);
  const selected = extensions.filter((extension) =>
    catalog.some((entry) => entry.name === extension),
  );
  return {
    catalog: catalog.map((entry) => entry.name),
    results: await checkExtensions(
      config.baseUrl,
      token,
      name,
      selected,
      catalog,
    ),
  };
}

async function checkExtensions(
  baseUrl: string,
  token: string,
  name: string,
  extensions: string[],
  catalog: CatalogEntry[] = [],
): Promise<DomainSearchResult[]> {
  const chunks = Array.from(
    { length: Math.ceil(extensions.length / CHECK_BATCH_SIZE) },
    (_, index) =>
      extensions.slice(
        index * CHECK_BATCH_SIZE,
        index * CHECK_BATCH_SIZE + CHECK_BATCH_SIZE,
      ),
  );
  const pages = await Promise.all(
    chunks.map((chunk) =>
      checkExtensionChunk(baseUrl, token, name, chunk, catalog),
    ),
  );
  return pages.flat();
}

async function checkExtensionChunk(
  baseUrl: string,
  token: string,
  name: string,
  extensions: string[],
  catalog: CatalogEntry[],
): Promise<DomainSearchResult[]> {
  const response = await fetch(`${baseUrl}/v1beta/domains/check`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      domains: extensions.map((extension) => ({ name, extension })),
      with_price: true,
      with_whois: false,
    }),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Openprovider check failed (${response.status})`);
  }
  return parseDomainCheck(await response.json(), catalog);
}

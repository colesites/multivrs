import "server-only";
import type { DomainSearchResult } from "@/features/domains/domain-marketplace";
import {
  DOMAIN_CHECK_BATCH_SIZE,
  type DomainSearcher,
} from "@/lib/domains/domain-search-stream";
import { searchLocalSandbox } from "@/lib/domains/local-sandbox-provider";
import { getOpenproviderCatalog } from "@/lib/domains/openprovider-catalog";
import {
  getOpenproviderConfig,
  getOpenproviderToken,
  isLocalOpenproviderSandbox,
} from "@/lib/domains/openprovider-client";
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

/** Openprovider as a `DomainSearcher`, or null when it isn't configured. */
export async function openproviderSearcher(): Promise<DomainSearcher | null> {
  if (isLocalOpenproviderSandbox()) {
    return {
      extensions: [...DEFAULT_TLDS],
      check: (name, extensions) => searchLocalSandbox(name, extensions),
    };
  }
  const config = getOpenproviderConfig();
  if (!config) return null;
  const token = await getOpenproviderToken(config);
  const catalog = await getOpenproviderCatalog(config.baseUrl, token);
  return {
    extensions: catalog.map((entry) => entry.name),
    check: (name, extensions, signal) =>
      checkExtensionChunk(
        config.baseUrl,
        token,
        name,
        extensions,
        catalog,
        signal,
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
    { length: Math.ceil(extensions.length / DOMAIN_CHECK_BATCH_SIZE) },
    (_, index) =>
      extensions.slice(
        index * DOMAIN_CHECK_BATCH_SIZE,
        index * DOMAIN_CHECK_BATCH_SIZE + DOMAIN_CHECK_BATCH_SIZE,
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
  signal?: AbortSignal,
): Promise<DomainSearchResult[]> {
  const response = await fetch(`${baseUrl}/v1beta/domains/check`, {
    method: "POST",
    signal,
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

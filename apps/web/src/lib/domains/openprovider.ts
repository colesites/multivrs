import "server-only";
import { z } from "zod";
import type { DomainSearchResult } from "@/features/domains/domain-marketplace";
import { domainRetailPrice } from "./pricing";

const TLDS = [
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
const loginSchema = z.object({ data: z.object({ token: z.string().min(1) }) });
const errorSchema = z.object({
  code: z.number().optional(),
  desc: z.string().optional(),
});
const moneySchema = z.object({ price: z.number(), currency: z.string() });
const resultSchema = z.object({
  domain: z.string(),
  status: z.string(),
  is_premium: z.union([z.boolean(), z.number()]).optional().default(false),
  price: z
    .object({
      product: moneySchema.optional(),
      reseller: moneySchema.optional(),
    })
    .optional(),
  premium: z
    .object({
      currency: z.string().optional(),
      price: z.object({ create: z.number().optional() }),
    })
    .optional(),
});
const checkSchema = z.object({
  data: z.object({ results: z.array(resultSchema) }),
});
const catalogSchema = z.object({
  data: z.object({
    total: z.number(),
    results: z.array(
      z.object({
        name: z.string(),
        status: z.string(),
        prices: z
          .object({
            create_price: z
              .object({
                product: moneySchema.optional(),
                reseller: moneySchema.optional(),
              })
              .optional(),
            renew_price: z
              .object({
                product: moneySchema.optional(),
                reseller: moneySchema.optional(),
              })
              .optional(),
          })
          .optional(),
      }),
    ),
  }),
});
type CatalogEntry = z.infer<typeof catalogSchema>["data"]["results"][number];
let catalogCache: { expiresAt: number; entries: CatalogEntry[] } | null = null;
let catalogRequest: Promise<CatalogEntry[]> | null = null;
let tokenCache: { expiresAt: number; token: string } | null = null;
let tokenRequest: Promise<string> | null = null;

function settings() {
  const username = process.env.OPENPROVIDER_USERNAME;
  const password = process.env.OPENPROVIDER_PASSWORD;
  if (!username || !password) return null;
  return {
    baseUrl: process.env.OPENPROVIDER_API_URL ?? "https://api.openprovider.eu",
    username,
    password,
  };
}

async function login(
  config: NonNullable<ReturnType<typeof settings>>,
): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now()) return tokenCache.token;
  if (tokenRequest) return tokenRequest;
  tokenRequest = requestToken(config);
  try {
    const token = await tokenRequest;
    tokenCache = { token, expiresAt: Date.now() + 10 * 60_000 };
    return token;
  } finally {
    tokenRequest = null;
  }
}

async function requestToken(
  config: NonNullable<ReturnType<typeof settings>>,
): Promise<string> {
  const response = await fetch(`${config.baseUrl}/v1beta/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      username: config.username,
      password: config.password,
    }),
    cache: "no-store",
  });
  if (!response.ok) {
    const error = errorSchema.safeParse(await response.json());
    const details = error.success
      ? `${error.data.desc ?? "Authentication failed"}${error.data.code ? ` (code ${error.data.code})` : ""}`
      : `Authentication failed (${response.status})`;
    throw new Error(`Openprovider: ${details}`);
  }
  return loginSchema.parse(await response.json()).data.token;
}

async function getCatalog(baseUrl: string, token: string) {
  if (catalogCache && catalogCache.expiresAt >= Date.now()) {
    return catalogCache.entries;
  }
  if (!catalogRequest) catalogRequest = fetchCatalog(baseUrl, token);
  try {
    const entries = await catalogRequest;
    catalogCache = {
      entries,
      expiresAt: Date.now() + 21_600_000,
    };
    return entries;
  } finally {
    catalogRequest = null;
  }
}

function toSearchResult(
  result: z.infer<typeof resultSchema>,
  catalogEntry?: CatalogEntry,
): DomainSearchResult {
  const available = result.status === "free";
  const standard = result.price?.reseller ?? result.price?.product;
  const premiumCost = result.premium?.price.create;
  const cost = premiumCost ?? standard?.price ?? null;
  const currency = result.premium?.currency ?? standard?.currency ?? "USD";
  const extension = result.domain.slice(result.domain.indexOf(".") + 1);
  const registrationPrice =
    available && cost !== null
      ? domainRetailPrice(extension, "create", cost)
      : null;
  const renewal =
    catalogEntry?.prices?.renew_price?.reseller ??
    catalogEntry?.prices?.renew_price?.product;
  const catalogCreate =
    catalogEntry?.prices?.create_price?.reseller ??
    catalogEntry?.prices?.create_price?.product;
  const sameProviderPrice =
    renewal && catalogCreate
      ? renewal.price === catalogCreate.price &&
        renewal.currency === catalogCreate.currency
      : false;
  return {
    domain: result.domain,
    available,
    premium: result.is_premium === true || result.is_premium === 1,
    price: registrationPrice,
    renewalPrice:
      available && renewal
        ? sameProviderPrice
          ? registrationPrice
          : domainRetailPrice(extension, "renew", renewal.price)
        : null,
    currency,
  };
}

export async function searchOpenprovider(
  name: string,
): Promise<DomainSearchResult[] | null> {
  return searchOpenproviderExtensions(name, TLDS);
}

export async function searchOpenproviderExtensions(
  name: string,
  extensions: string[],
): Promise<DomainSearchResult[] | null> {
  const config = settings();
  if (!config) return null;
  const token = await login(config);
  return checkExtensions(config.baseUrl, token, name, extensions);
}

async function checkExtensions(
  baseUrl: string,
  token: string,
  name: string,
  extensions: string[],
  catalog: CatalogEntry[] = [],
) {
  const chunks = Array.from(
    { length: Math.ceil(extensions.length / 12) },
    (_, index) => extensions.slice(index * 12, index * 12 + 12),
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
) {
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
  if (!response.ok)
    throw new Error(`Openprovider check failed (${response.status})`);
  return checkSchema.parse(await response.json()).data.results.map((result) => {
    const extension = result.domain.slice(result.domain.indexOf(".") + 1);
    return toSearchResult(
      result,
      catalog.find((entry) => entry.name === extension),
    );
  });
}

async function fetchCatalog(
  baseUrl: string,
  token: string,
): Promise<CatalogEntry[]> {
  const first = await fetch(
    `${baseUrl}/v1beta/tlds?limit=500&offset=0&with_price=true`,
    {
      headers: { authorization: `Bearer ${token}` },
      next: { revalidate: 21_600 },
    },
  );
  if (!first.ok)
    throw new Error(`Openprovider catalog failed (${first.status})`);
  const page = catalogSchema.parse(await first.json());
  const offsets = Array.from(
    { length: Math.ceil(page.data.total / 500) - 1 },
    (_, index) => (index + 1) * 500,
  );
  const rest = await Promise.all(
    offsets.map(async (offset) => {
      const response = await fetch(
        `${baseUrl}/v1beta/tlds?limit=500&offset=${offset}&with_price=true`,
        {
          headers: { authorization: `Bearer ${token}` },
          next: { revalidate: 21_600 },
        },
      );
      if (!response.ok)
        throw new Error(`Openprovider catalog failed (${response.status})`);
      return catalogSchema.parse(await response.json()).data.results;
    }),
  );
  return [...page.data.results, ...rest.flat()]
    .filter((item) => item.status === "ACT")
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function searchOpenproviderCatalog(
  name: string,
  extensions: string[],
): Promise<{ catalog: string[]; results: DomainSearchResult[] } | null> {
  const config = settings();
  if (!config) return null;
  const token = await login(config);
  const catalog = await getCatalog(config.baseUrl, token);
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

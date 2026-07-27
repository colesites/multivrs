import { NextResponse } from "next/server";
import {
  normalizeDomainQuery,
  RELEVANT_DOMAIN_EXTENSIONS,
} from "@/features/domains/domain-marketplace";
import {
  searchOpenproviderCatalog,
  searchOpenproviderExtensions,
} from "@/lib/domains/openprovider";
import { logError } from "@/lib/services/logger.service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const name = normalizeDomainQuery(
    new URL(request.url).searchParams.get("q") ?? "",
  );
  const url = new URL(request.url);
  const requestedExtensions = (url.searchParams.get("tlds") ?? "")
    .split(",")
    .map((extension) => extension.toLowerCase().replace(/[^a-z0-9-]/g, ""))
    .filter(Boolean)
    .slice(0, 12);
  const requestedTld = url.searchParams.get("tld");
  if (name.length < 2) return NextResponse.json({ results: [] });
  try {
    const extensions = requestedTld
      ? [requestedTld]
      : requestedExtensions.length
        ? requestedExtensions
        : [...RELEVANT_DOMAIN_EXTENSIONS].slice(0, 4);
    if (url.searchParams.get("fast") === "1") {
      const results = await searchOpenproviderExtensions(name, extensions);
      if (!results) {
        return NextResponse.json(
          { error: "provider_not_configured", results: [] },
          { status: 503 },
        );
      }
      return NextResponse.json({ results });
    }
    const response = await searchOpenproviderCatalog(name, extensions);
    if (!response) {
      return NextResponse.json(
        { error: "provider_not_configured", results: [] },
        { status: 503 },
      );
    }
    return NextResponse.json({
      results: response.results,
      catalog: response.catalog,
      total: requestedTld ? 1 : response.catalog.length,
    });
  } catch (error) {
    logError("domains.search.provider_failed", error);
    return NextResponse.json(
      {
        error: "provider_unavailable",
        message: "Domain search is temporarily unavailable.",
        results: [],
      },
      { status: 502 },
    );
  }
}

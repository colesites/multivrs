import { describe, expect, test } from "bun:test";
import {
  normalizeDomainQuery,
  relevantDomainExtensions,
} from "../../apps/web/src/features/domains/domain-marketplace";
import {
  domainRetailPrice,
  retailPrice,
  roundTo99,
} from "../../apps/web/src/lib/domains/pricing";

describe("domain marketplace", () => {
  test("normalizes user input to a registrable label", () => {
    expect(normalizeDomainQuery("https://Hello World.com/path")).toBe(
      "helloworld",
    );
    expect(normalizeDomainQuery("--studio--")).toBe("studio");
  });

  test("applies the architecture pricing floor and proportional margin", () => {
    expect(roundTo99(13.4)).toBe(13.99);
    expect(retailPrice(10, { marginPercent: 0.1, minimumMargin: 2.5 })).toBe(
      12.99,
    );
    expect(retailPrice(100, { marginPercent: 0.2, minimumMargin: 2.5 })).toBe(
      119.99,
    );
  });

  test("uses the approved .com registration and renewal prices", () => {
    expect(domainRetailPrice("com", "create", 11.98)).toBe(14);
    expect(domainRetailPrice("com", "renew", 16.98)).toBe(19.99);
    expect(domainRetailPrice("dev", "create", 10)).toBe(retailPrice(10));
  });

  test("ranks product-relevant extensions ahead of the provider catalog order", () => {
    const catalog = ["xyz", "net", "io", "app", "com", "dev", "org"];
    expect(relevantDomainExtensions(catalog)).toEqual([
      "com",
      "dev",
      "app",
      "io",
      "org",
      "net",
    ]);
  });
});

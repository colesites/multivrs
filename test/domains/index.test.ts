import { describe, expect, test } from "bun:test";
import {
  normalizeDomainQuery,
  relevantDomainExtensions,
} from "../../apps/web/src/features/domains/domain-marketplace";
import { buildSignInHref, normalizeAuthReturnPath } from "../../apps/web/src/lib/auth/return-path";
import {
  connectDomainSchema,
  dnsRecordInputSchema,
} from "../../apps/web/src/lib/domains/dns.schemas";
import { domainCheckoutSchema } from "../../apps/web/src/lib/domains/domain-checkout.schemas";
import { sandboxDomainOrderSchema } from "../../apps/web/src/lib/domains/domain-order.schemas";
import { domainRetailPrice, retailPrice, roundTo99 } from "../../apps/web/src/lib/domains/pricing";

describe("domain marketplace", () => {
  test("normalizes user input to a registrable label", () => {
    expect(normalizeDomainQuery("https://Hello World.com/path")).toBe("helloworld");
    expect(normalizeDomainQuery("--studio--")).toBe("studio");
  });

  test("applies the architecture pricing floor and proportional margin", () => {
    expect(roundTo99(13.4)).toBe(13.99);
    expect(retailPrice(10, { marginPercent: 0.1, minimumMargin: 2.5 })).toBe(12.99);
    expect(retailPrice(100, { marginPercent: 0.2, minimumMargin: 2.5 })).toBe(119.99);
  });

  test("uses the approved .com registration and renewal prices", () => {
    expect(domainRetailPrice("com", "create", 11.98)).toBe(14);
    expect(domainRetailPrice("com", "renew", 16.98)).toBe(19.99);
    expect(domainRetailPrice("dev", "create", 10)).toBe(retailPrice(10));
  });

  test("ranks product-relevant extensions ahead of the provider catalog order", () => {
    const catalog = ["xyz", "net", "io", "app", "com", "dev", "org"];
    expect(relevantDomainExtensions(catalog)).toEqual(["com", "dev", "app", "io", "org", "net"]);
  });

  test("normalizes externally connected domains", () => {
    const result = connectDomainSchema.parse({
      hostname: "https://Docs.Example.com/path",
      projectId: "a9dca88a-0c1a-4dfa-8bb8-b79b9b65a0ab",
    });
    expect(result.hostname).toBe("docs.example.com");
  });

  test("validates supported DNS records and MX priorities", () => {
    expect(
      dnsRecordInputSchema.parse({
        name: "@",
        type: "A",
        value: "192.0.2.1",
        ttl: 3600,
        priority: null,
      }).type,
    ).toBe("A");
    expect(
      dnsRecordInputSchema.safeParse({
        name: "@",
        type: "MX",
        value: "mail.example.com",
        ttl: 3600,
        priority: null,
      }).success,
    ).toBe(false);
    expect(
      dnsRecordInputSchema.safeParse({
        name: "@",
        type: "A",
        value: "192.0.2.1",
        ttl: 120,
      }).success,
    ).toBe(false);
  });

  test("requires explicit confirmation for sandbox registration", () => {
    const order = {
      hostname: "hello.com",
    };
    expect(domainCheckoutSchema.safeParse({ hostnames: [order.hostname] }).success).toBe(true);
    expect(sandboxDomainOrderSchema.safeParse(order).success).toBe(false);
    expect(
      sandboxDomainOrderSchema.safeParse({
        ...order,
        confirmSandbox: true,
      }).success,
    ).toBe(true);
  });

  test("preserves safe checkout return paths and rejects external redirects", () => {
    expect(normalizeAuthReturnPath("/domains?q=hello&checkout=1")).toBe(
      "/domains?q=hello&checkout=1",
    );
    expect(normalizeAuthReturnPath("//attacker.example/path")).toBe("/dashboard");
    expect(buildSignInHref("/domains?checkout=1")).toBe("/login?from=%2Fdomains%3Fcheckout%3D1");
  });
});

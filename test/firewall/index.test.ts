/**
 * Phase 1 feature test — @multivrs/firewall (WAF decision logic).
 * This is the "does bot protection work" gate.
 */
import { describe, expect, test } from "bun:test";
import {
  createFirewallBypassToken,
  evaluateFirewall,
  parseFirewallRules,
  verifyFirewallBypassToken,
} from "@multivrs/firewall";

const base = { path: "/", method: "GET" };

describe("@multivrs/firewall evaluateFirewall", () => {
  test("allows by default when no rule matches", () => {
    expect(evaluateFirewall([], base).action).toBe("allow");
  });

  test("blocks a known bad IP", () => {
    const rules = parseFirewallRules([
      {
        id: "block-ip",
        action: "deny",
        conditions: [{ type: "ip", op: "eq", value: "1.2.3.4" }],
      },
    ]);
    expect(evaluateFirewall(rules, { ...base, ip: "1.2.3.4" }).action).toBe("deny");
    expect(evaluateFirewall(rules, { ...base, ip: "5.6.7.8" }).action).toBe("allow");
  });

  test("challenges a bot user-agent (bot protection)", () => {
    const rules = parseFirewallRules([
      {
        id: "bot",
        action: "challenge",
        conditions: [{ type: "user_agent", op: "contains", value: "badbot" }],
      },
    ]);
    const decision = evaluateFirewall(rules, {
      ...base,
      userAgent: "Mozilla badbot/1.0",
    });
    expect(decision.action).toBe("challenge");
    expect(decision.ruleId).toBe("bot");
  });

  test("AND-s conditions (path + method) and can rate-limit", () => {
    const rules = parseFirewallRules([
      {
        id: "rl-admin-post",
        action: "rate_limit",
        conditions: [
          { type: "path", op: "starts_with", value: "/admin" },
          { type: "method", op: "eq", value: "POST" },
        ],
      },
    ]);
    expect(evaluateFirewall(rules, { path: "/admin/x", method: "POST" }).action).toBe("rate_limit");
    // method doesn't match → no rule matches → allow
    expect(evaluateFirewall(rules, { path: "/admin/x", method: "GET" }).action).toBe("allow");
  });

  test("blocks by country list and matches headers case-insensitively", () => {
    const rules = parseFirewallRules([
      {
        id: "geo",
        action: "deny",
        conditions: [{ type: "country", op: "in", value: ["RU", "KP"] }],
      },
      {
        id: "hdr",
        action: "deny",
        conditions: [{ type: "header", key: "X-Block", op: "eq", value: "yes" }],
      },
    ]);
    expect(evaluateFirewall(rules, { ...base, country: "RU" }).action).toBe("deny");
    expect(evaluateFirewall(rules, { ...base, headers: { "x-block": "yes" } }).action).toBe("deny");
  });

  test("skips disabled rules", () => {
    const rules = parseFirewallRules([
      {
        id: "off",
        action: "deny",
        enabled: false,
        conditions: [{ type: "path", op: "eq", value: "/" }],
      },
    ]);
    expect(evaluateFirewall(rules, base).action).toBe("allow");
  });
});

describe("@multivrs/firewall bypass tokens", () => {
  test("accepts a signed token only for its project and path", async () => {
    const secret = "a-long-test-secret-that-is-never-used-in-production";
    const token = await createFirewallBypassToken(
      {
        expiresAt: Date.now() + 60_000,
        pathPrefix: "/preview",
        projectId: "project-one",
        subject: "user-one",
      },
      secret,
    );
    expect(
      await verifyFirewallBypassToken(token, secret, {
        path: "/preview/dashboard",
        projectId: "project-one",
      }),
    ).toBe(true);
    expect(
      await verifyFirewallBypassToken(token, secret, {
        path: "/production",
        projectId: "project-one",
      }),
    ).toBe(false);
    expect(
      await verifyFirewallBypassToken(token, secret, {
        path: "/preview",
        projectId: "project-two",
      }),
    ).toBe(false);
  });

  test("rejects expired and tampered tokens", async () => {
    const secret = "another-long-test-secret-that-is-not-production";
    const token = await createFirewallBypassToken(
      {
        expiresAt: Date.now() - 1,
        pathPrefix: "/",
        projectId: "project-one",
        subject: "system",
      },
      secret,
    );
    expect(
      await verifyFirewallBypassToken(token, secret, {
        path: "/",
        projectId: "project-one",
      }),
    ).toBe(false);
    expect(
      await verifyFirewallBypassToken(`${token}x`, secret, {
        path: "/",
        projectId: "project-one",
      }),
    ).toBe(false);
  });
});

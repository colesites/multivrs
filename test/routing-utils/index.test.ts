/**
 * Phase 1 feature test — @multivrs/routing-utils (route rule engine).
 */
import { describe, expect, test } from "bun:test";
import { ValidationError } from "@multivrs/error-utils";
import { matchRoutes, parseRoutes } from "@multivrs/routing-utils";

describe("@multivrs/routing-utils matchRoutes", () => {
  test("rewrites with backreferences", () => {
    const result = matchRoutes([{ src: "/api/(.*)", dest: "/functions/$1" }], {
      pathname: "/api/users",
    });
    expect(result.matched).toBe(true);
    expect(result.isRedirect).toBe(false);
    expect(result.pathname).toBe("/functions/users");
  });

  test("redirects on a 3xx status and stops", () => {
    const result = matchRoutes(
      [
        { src: "/old", dest: "/new", status: 308 },
        { src: "/new", dest: "/should-not-apply" },
      ],
      { pathname: "/old" },
    );
    expect(result.isRedirect).toBe(true);
    expect(result.redirectLocation).toBe("/new");
    expect(result.status).toBe(308);
  });

  test("header rules with continue accumulate, then a later rule rewrites", () => {
    const result = matchRoutes(
      [
        { src: "/(.*)", headers: { "x-frame-options": "DENY" }, continue: true },
        { src: "/page", dest: "/page.html" },
      ],
      { pathname: "/page" },
    );
    expect(result.headers["x-frame-options"]).toBe("DENY");
    expect(result.pathname).toBe("/page.html");
  });

  test("respects the methods filter", () => {
    const routes = [{ src: "/(.*)", methods: ["POST"], status: 405 }];
    expect(matchRoutes(routes, { pathname: "/", method: "GET" }).matched).toBe(false);
    const posted = matchRoutes(routes, { pathname: "/", method: "POST" });
    expect(posted.matched).toBe(true);
    expect(posted.status).toBe(405);
  });

  test("reports no match", () => {
    expect(matchRoutes([{ src: "/x" }], { pathname: "/y" }).matched).toBe(false);
  });
});

describe("@multivrs/routing-utils parseRoutes", () => {
  test("accepts valid routes and rejects malformed ones", () => {
    expect(parseRoutes([{ src: "/a", status: 301, dest: "/b" }])).toHaveLength(1);
    expect(() => parseRoutes([{ status: 301 }])).toThrow(ValidationError);
  });
});

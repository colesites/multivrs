/**
 * Phase 1 feature test — @multivrs/edge (middleware primitives + geo).
 */
import { describe, expect, test } from "bun:test";
import { getGeo, json, next, redirect, rewrite } from "@multivrs/edge";

describe("@multivrs/edge middleware primitives", () => {
  test("next/rewrite/redirect/json build the right descriptors", () => {
    expect(next()).toEqual({ type: "next", headers: undefined });
    expect(rewrite("/internal")).toEqual({
      type: "rewrite",
      url: "/internal",
      headers: undefined,
    });
    expect(redirect("/login")).toEqual({
      type: "redirect",
      url: "/login",
      status: 307,
      headers: undefined,
    });
    expect(redirect("/perm", 308).status).toBe(308);
    expect(json({ ok: true }, 201)).toEqual({
      type: "json",
      body: { ok: true },
      status: 201,
      headers: undefined,
    });
  });
});

describe("@multivrs/edge getGeo", () => {
  test("reads Cloudflare geo headers", () => {
    const headers = new Headers({
      "cf-ipcountry": "US",
      "cf-connecting-ip": "203.0.113.7",
    });
    expect(getGeo(headers)).toEqual({ ip: "203.0.113.7", country: "US" });
  });

  test("falls back to x-forwarded-for for the IP", () => {
    const headers = new Headers({ "x-forwarded-for": "198.51.100.2, 10.0.0.1" });
    expect(getGeo(headers)).toEqual({ ip: "198.51.100.2", country: undefined });
  });
});

/**
 * Test helper: a `fetch` implementation that records the requests it receives
 * and returns canned JSON responses — lets us drive @multivrs/client through a
 * full request/response round-trip without a network or a running server.
 * (Mirrors how vercel/vercel/test/lib helpers stub the deploy transport.)
 */

export interface RecordedRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: unknown;
}

export interface FakeResponse {
  status?: number;
  body: unknown;
}

import type { FetchLike } from "@multivrs/client";

export interface FakeFetch {
  fetch: FetchLike;
  calls: RecordedRequest[];
}

function readHeaders(init?: RequestInit): Record<string, string> {
  const out: Record<string, string> = {};
  const h = init?.headers;
  if (!h) {
    return out;
  }
  if (h instanceof Headers) {
    h.forEach((value, key) => {
      out[key] = value;
    });
  } else if (Array.isArray(h)) {
    for (const [key, value] of h) {
      out[key] = value;
    }
  } else {
    Object.assign(out, h);
  }
  return out;
}

export function createFakeFetch(handler: (req: RecordedRequest) => FakeResponse): FakeFetch {
  const calls: RecordedRequest[] = [];

  const fetchImpl: FetchLike = async (input, init) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const recorded: RecordedRequest = {
      url,
      method: init?.method ?? "GET",
      headers: readHeaders(init),
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
    };
    calls.push(recorded);

    const { status = 200, body } = handler(recorded);
    return new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json" },
    });
  };

  return { fetch: fetchImpl, calls };
}

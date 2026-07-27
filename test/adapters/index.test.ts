import { describe, expect, test } from "bun:test";
import { createMcpHandler } from "@multivrs/mcp-adapter";

describe("MCP adapter", () => {
  test("serves a validated JSON-RPC request", async () => {
    const handler = createMcpHandler({ request: async (message) => ({ method: message.method }) });
    const response = await handler(
      new Request("https://fixture.test/mcp", {
        body: JSON.stringify({ id: 1, jsonrpc: "2.0", method: "tools/list" }),
        headers: { "content-type": "application/json" },
        method: "POST",
      }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      id: 1,
      jsonrpc: "2.0",
      result: { method: "tools/list" },
    });
  });

  test("rejects malformed protocol input", async () => {
    const handler = createMcpHandler({ request: async () => ({}) });
    const response = await handler(
      new Request("https://fixture.test/mcp", { body: "{}", method: "POST" }),
    );
    expect(response.status).toBe(400);
  });
});

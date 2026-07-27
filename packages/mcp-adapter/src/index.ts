import { z } from "zod";

const requestSchema = z.object({
  id: z.union([z.string(), z.number()]).nullable().optional(),
  jsonrpc: z.literal("2.0"),
  method: z.string().min(1),
  params: z.unknown().optional(),
});

export interface McpServerAdapter {
  request(message: z.infer<typeof requestSchema>): Promise<unknown>;
}

export function createMcpHandler(server: McpServerAdapter) {
  return async (request: Request): Promise<Response> => {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }
    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json(
        { error: { code: -32600, message: "Invalid Request" }, id: null, jsonrpc: "2.0" },
        { status: 400 },
      );
    }
    try {
      const result = await server.request(parsed.data);
      return Response.json({ id: parsed.data.id ?? null, jsonrpc: "2.0", result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Internal error";
      return Response.json(
        { error: { code: -32603, message }, id: parsed.data.id ?? null, jsonrpc: "2.0" },
        { status: 500 },
      );
    }
  };
}

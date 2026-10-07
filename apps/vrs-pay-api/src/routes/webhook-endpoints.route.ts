import { Hono } from "hono";
import type { AppDeps, AppEnv } from "../app.types";
import { readJson } from "../lib/read-json";
import {
  createWebhookEndpoint,
  disableWebhookEndpoint,
  listWebhookEndpoints,
} from "../services/webhook-endpoint.service";
import { CreateWebhookEndpointSchema } from "./webhook-endpoint.schema";

/** `/v1/webhook_endpoints` — where VRS Pay sends signed events. */
export function webhookEndpointRoutes(deps: AppDeps): Hono<AppEnv> {
  return new Hono<AppEnv>()
    .post("/", async (c) => {
      const input = CreateWebhookEndpointSchema.parse(await readJson(c));
      return c.json(await createWebhookEndpoint(deps, c.get("merchant"), input));
    })
    .get("/", async (c) => {
      const data = await listWebhookEndpoints(deps, c.get("merchant"));
      return c.json({ object: "list", data });
    })
    .delete("/:id", async (c) =>
      c.json(await disableWebhookEndpoint(deps, c.get("merchant"), c.req.param("id"))),
    );
}

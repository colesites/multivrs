import { Hono } from "hono";
import type { AppDeps, AppEnv } from "../app.types";
import { readJson } from "../lib/read-json";
import { EVENT_TYPES } from "../services/event.types";
import {
  createWebhookEndpoint,
  disableWebhookEndpoint,
  listEndpointDeliveries,
  listWebhookEndpoints,
  retryDelivery,
  sendTestWebhook,
  updateWebhookEndpoint,
} from "../services/webhook-endpoint.service";
import {
  CreateWebhookEndpointSchema,
  UpdateWebhookEndpointSchema,
} from "./webhook-endpoint.schema";

/** `/v1/webhook_endpoints` — where VRS Pay sends signed events. */
export function webhookEndpointRoutes(deps: AppDeps): Hono<AppEnv> {
  return new Hono<AppEnv>()
    .get("/event_types", (c) => c.json({ object: "list", data: EVENT_TYPES }))
    .post("/", async (c) => {
      const input = CreateWebhookEndpointSchema.parse(await readJson(c));
      return c.json(await createWebhookEndpoint(deps, c.get("merchant"), input));
    })
    .get("/", async (c) => {
      const data = await listWebhookEndpoints(deps, c.get("merchant"));
      return c.json({ object: "list", data });
    })
    .patch("/:id", async (c) => {
      const input = UpdateWebhookEndpointSchema.parse(await readJson(c));
      return c.json(await updateWebhookEndpoint(deps, c.get("merchant"), c.req.param("id"), input));
    })
    .delete("/:id", async (c) =>
      c.json(await disableWebhookEndpoint(deps, c.get("merchant"), c.req.param("id"))),
    )
    .get("/:id/deliveries", async (c) => {
      const data = await listEndpointDeliveries(deps, c.get("merchant"), c.req.param("id"));
      return c.json({ object: "list", data });
    })
    .post("/:id/deliveries/:deliveryId/retry", async (c) =>
      c.json(
        await retryDelivery(deps, c.get("merchant"), c.req.param("id"), c.req.param("deliveryId")),
      ),
    )
    .post("/:id/test", async (c) =>
      c.json(await sendTestWebhook(deps, c.get("merchant"), c.req.param("id"))),
    );
}

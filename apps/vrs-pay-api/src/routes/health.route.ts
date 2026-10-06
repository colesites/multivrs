import { Hono } from "hono";
import type { AppEnv } from "../app.types";
import { API_VERSION } from "../constants";

/** Unauthenticated liveness check for load balancers and uptime monitors. */
export function healthRoutes(): Hono<AppEnv> {
  return new Hono<AppEnv>().get("/health", (c) => c.json({ status: "ok", version: API_VERSION }));
}

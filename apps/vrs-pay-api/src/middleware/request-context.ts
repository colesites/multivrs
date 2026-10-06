import { newId } from "@vrs-pay/core";
import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "../app.types";
import { API_VERSION, REQUEST_ID_HEADER, VERSION_HEADER } from "../constants";

/** Gives every request an id (echoed in errors) and stamps the API version. */
export const requestContext: MiddlewareHandler<AppEnv> = async (c, next) => {
  const requestId = newId("request");
  c.set("requestId", requestId);
  await next();
  c.res.headers.set(REQUEST_ID_HEADER, requestId);
  c.res.headers.set(VERSION_HEADER, API_VERSION);
};

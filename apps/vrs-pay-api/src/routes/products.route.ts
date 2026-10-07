import { Hono } from "hono";
import type { AppDeps, AppEnv } from "../app.types";
import { readJson } from "../lib/read-json";
import { createPrice, findPrice, listPrices, updatePrice } from "../services/price.service";
import {
  createProduct,
  getProduct,
  listProducts,
  toProductPrice,
  updateProduct,
} from "../services/product.service";
import {
  CreatePriceSchema,
  CreateProductSchema,
  UpdatePriceSchema,
  UpdateProductSchema,
} from "./product.schema";

const ACTIVE_FILTER: Record<string, boolean> = { true: true, false: false };

/** `/v1/products` — what a merchant sells, each with its prices. */
export function productRoutes(deps: AppDeps): Hono<AppEnv> {
  return new Hono<AppEnv>()
    .get("/", async (c) => {
      const active = ACTIVE_FILTER[c.req.query("active") ?? ""];
      return c.json({ object: "list", data: await listProducts(deps, c.get("merchant"), active) });
    })
    .post("/", async (c) => {
      const input = CreateProductSchema.parse(await readJson(c));
      return c.json(await createProduct(deps, c.get("merchant"), input));
    })
    .get("/:id", async (c) => c.json(await getProduct(deps, c.get("merchant"), c.req.param("id"))))
    .post("/:id", async (c) => {
      const input = UpdateProductSchema.parse(await readJson(c));
      return c.json(await updateProduct(deps, c.get("merchant"), c.req.param("id"), input));
    });
}

/** `/v1/prices` — list (by lookup key), add to a product, archive or relabel. */
export function priceRoutes(deps: AppDeps): Hono<AppEnv> {
  return new Hono<AppEnv>()
    .get("/", async (c) => {
      const lookupKeys = (c.req.queries("lookup_keys") ?? []).flatMap((v) => v.split(","));
      const active = ACTIVE_FILTER[c.req.query("active") ?? ""];
      const data = await listPrices(deps, c.get("merchant"), { lookupKeys, active });
      return c.json({ object: "list", data });
    })
    .post("/", async (c) => {
      const input = CreatePriceSchema.parse(await readJson(c));
      return c.json(await createPrice(deps, c.get("merchant"), input));
    })
    .get("/:id", async (c) => {
      const { price } = await findPrice(deps, c.get("merchant"), c.req.param("id"));
      return c.json(toProductPrice(price));
    })
    .post("/:id", async (c) => {
      const input = UpdatePriceSchema.parse(await readJson(c));
      return c.json(await updatePrice(deps, c.get("merchant"), c.req.param("id"), input));
    });
}

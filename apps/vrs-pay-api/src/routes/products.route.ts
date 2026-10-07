import { Hono } from "hono";
import type { AppDeps, AppEnv } from "../app.types";
import { readJson } from "../lib/read-json";
import { createPrice, findPrice, setPriceActive } from "../services/price.service";
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

/** `/v1/prices` — add a price to a product, or archive one. */
export function priceRoutes(deps: AppDeps): Hono<AppEnv> {
  return new Hono<AppEnv>()
    .post("/", async (c) => {
      const input = CreatePriceSchema.parse(await readJson(c));
      return c.json(await createPrice(deps, c.get("merchant"), input));
    })
    .get("/:id", async (c) => {
      const { price } = await findPrice(deps, c.get("merchant"), c.req.param("id"));
      return c.json(toProductPrice(price));
    })
    .post("/:id", async (c) => {
      const { active } = UpdatePriceSchema.parse(await readJson(c));
      return c.json(await setPriceActive(deps, c.get("merchant"), c.req.param("id"), active));
    });
}

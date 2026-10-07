import { useAction } from "../context";
import type { Product } from "../types";

/** Saves `body` to the product and reports the API's error, if any. */
export function useProductSave(product: Product, onSaved: () => void) {
  const { run } = useAction();
  return async (body: object) => {
    const result = await run(`/v1/products/${product.id}`, { body });
    if (!result.error) onSaved();
    return result.error;
  };
}

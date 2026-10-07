import type { Product } from "../types";
import { Input, Textarea } from "../ui";
import { useKeyValueRows } from "./key-value-rows";
import { EditCard } from "./product-edit";
import { useProductSave } from "./product-save";
import { Field } from "./section-form";

export interface Props {
  product: Product;
  onSaved: () => void;
}

const ON = new Set(["", "on", "yes", "true"]);
const OFF = new Set(["off", "no", "false"]);

/** "on" → true, "off" → false, "5" → a limit of 5; anything else is null. */
function featureValue(text: string): boolean | number | null {
  const value = text.toLowerCase();
  if (ON.has(value)) return true;
  if (OFF.has(value)) return false;
  return /^\d+$/.test(value) ? Number(value) : null;
}

/** A free trial and what subscribers get, like Stripe's Trials and Features. */
export function TrialFeaturesForm({ product, onSaved }: Props) {
  const save = useProductSave(product, onSaved);
  const features = useKeyValueRows({
    prefix: "feature-",
    initial: Object.entries(product.features).map(([k, v]) => [
      k,
      typeof v === "boolean" ? (v ? "on" : "off") : String(v),
    ]),
    keyPlaceholder: "Feature key, e.g. custom_domains",
    valuePlaceholder: "on, off, or a limit like 5",
  });
  return (
    <EditCard
      title="Trial and features"
      description="Subscribers get these features; your app checks them through entitlements."
      button="Save"
      submit={async (fields) => {
        const parsed: Record<string, boolean | number> = {};
        for (const [key, text] of features.read(fields)) {
          const value = featureValue(text);
          if (value === null) return `Use on, off or a number for ${key}.`;
          parsed[key] = value;
        }
        return save({
          trial_days: Number(fields.get("trial_days") ?? 0),
          features: parsed,
        });
      }}
    >
      <Field
        label="Free trial"
        hint="Days before the first charge. 0 for none."
      >
        <Input
          name="trial_days"
          type="number"
          min={0}
          max={365}
          defaultValue={product.trial_days}
          className="w-32"
        />
      </Field>
      <Field label="Features" hint="Lowercase keys with letters, digits and _.">
        {features.fields}
      </Field>
    </EditCard>
  );
}

/** The image and selling points a checkout or pricing page shows. */
export function ProductPageForm({ product, onSaved }: Props) {
  const save = useProductSave(product, onSaved);
  const [image, ...moreImages] = product.images;
  return (
    <EditCard
      title="Product page"
      description="An image and the selling points a pricing page lists."
      button="Save"
      submit={async (fields) => {
        const url = String(fields.get("image") ?? "").trim();
        const lines = String(fields.get("marketing_features") ?? "")
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);
        return save({
          images: url ? [url, ...moreImages] : moreImages,
          marketing_features: lines.map((name) => ({ name })),
        });
      }}
    >
      {image && (
        <img
          src={image}
          alt={product.name}
          className="size-20 rounded-lg border border-line object-cover"
        />
      )}
      <Field label="Image URL" hint="A square image works best.">
        <Input
          name="image"
          type="url"
          defaultValue={image ?? ""}
          placeholder="https://"
        />
      </Field>
      <Field
        label="Marketing features"
        hint="One per line, up to 15. e.g. 100 GB cloud storage"
      >
        <Textarea
          name="marketing_features"
          rows={4}
          defaultValue={product.marketing_features
            .map((f) => f.name)
            .join("\n")}
        />
      </Field>
    </EditCard>
  );
}

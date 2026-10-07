import { useState } from "react";
import { NativeSelect } from "../ui";
import { Field } from "./section-form";

const AGGREGATES = [
  { id: "sum", label: "Total of all usage reported" },
  { id: "max", label: "Highest reading in the period" },
  { id: "last", label: "Last reading in the period" },
];

/** Stripe's pricing model menu: a flat rate, or usage-based (per unit, charged after each period). */
export function PricingModelField({ prefix = "" }: { prefix?: string }) {
  const [model, setModel] = useState("licensed");
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field
        label="Pricing model"
        hint={
          model === "metered"
            ? "The price is per unit. You report usage; each period's usage is charged when it ends."
            : undefined
        }
      >
        <NativeSelect
          name={`${prefix}usage_type`}
          value={model}
          onChange={(e) => setModel(e.target.value)}
        >
          <option value="licensed">Flat rate</option>
          <option value="metered">Usage-based</option>
        </NativeSelect>
      </Field>
      {model === "metered" && (
        <Field label="Usage counts as">
          <NativeSelect name={`${prefix}aggregate_usage`} defaultValue="sum">
            {AGGREGATES.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </NativeSelect>
        </Field>
      )}
    </div>
  );
}

/** The pricing model as API fields; nothing extra for a flat rate. */
export function readPricingModel(fields: FormData, prefix = "") {
  if (fields.get(`${prefix}usage_type`) !== "metered") return {};
  return {
    usage_type: "metered",
    aggregate_usage: String(fields.get(`${prefix}aggregate_usage`) ?? "sum"),
  };
}

import { useKeyValueRows } from "./key-value-rows";
import { EditCard } from "./product-edit";
import type { Props } from "./product-extras";
import { useProductSave } from "./product-save";

/** Your own key and value notes; customers never see them. */
export function MetadataForm({ product, onSaved }: Props) {
  const save = useProductSave(product, onSaved);
  const rows = useKeyValueRows({
    prefix: "meta-",
    initial: Object.entries(product.metadata),
    keyPlaceholder: "Key",
    valuePlaceholder: "Value",
  });
  return (
    <EditCard
      title="Metadata"
      description="Notes for your own systems, like an internal plan id. Customers never see them."
      button="Save"
      submit={async (fields) =>
        save({ metadata: Object.fromEntries(rows.read(fields)) })
      }
    >
      {rows.fields}
    </EditCard>
  );
}

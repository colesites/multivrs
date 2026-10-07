import { Plus, X } from "lucide-react";
import { useState } from "react";
import { Button, Input } from "../ui";

interface Row {
  id: number;
  key: string;
  value: string;
}

/**
 * Editable key and value rows (metadata, features). Inputs are named by
 * `prefix` and row id; `read` returns the filled rows, blank keys skipped.
 */
export function useKeyValueRows({
  prefix,
  initial,
  keyPlaceholder,
  valuePlaceholder,
}: {
  prefix: string;
  initial: Array<[string, string]>;
  keyPlaceholder: string;
  valuePlaceholder: string;
}) {
  const [rows, setRows] = useState<Row[]>(() =>
    initial.length > 0
      ? initial.map(([key, value], id) => ({ id, key, value }))
      : [{ id: 0, key: "", value: "" }],
  );
  const add = () =>
    setRows([
      ...rows,
      { id: Math.max(-1, ...rows.map((r) => r.id)) + 1, key: "", value: "" },
    ]);
  const fields = (
    <div className="grid gap-2">
      {rows.map((row) => (
        <div
          key={row.id}
          className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2"
        >
          <Input
            name={`${prefix}key-${row.id}`}
            defaultValue={row.key}
            placeholder={keyPlaceholder}
            aria-label={keyPlaceholder}
          />
          <Input
            name={`${prefix}value-${row.id}`}
            defaultValue={row.value}
            placeholder={valuePlaceholder}
            aria-label={valuePlaceholder}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setRows(rows.filter((r) => r.id !== row.id))}
            aria-label="Remove row"
          >
            <X className="size-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-fit"
        onClick={add}
      >
        <Plus className="size-4" /> Add row
      </Button>
    </div>
  );
  const read = (form: FormData): Array<[string, string]> =>
    rows
      .map((r): [string, string] => [
        String(form.get(`${prefix}key-${r.id}`) ?? "").trim(),
        String(form.get(`${prefix}value-${r.id}`) ?? "").trim(),
      ])
      .filter(([key]) => key !== "");
  return { fields, read };
}

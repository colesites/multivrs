import { useId } from "react";

/**
 * Which events an endpoint receives: everything (["*"]) or a chosen list.
 * `value` is what the API stores in enabled_events.
 */
export function WebhookEventsPicker({
  eventTypes,
  value,
  onChange,
}: {
  eventTypes: string[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const scope = useId();
  const all = value.includes("*");
  const toggle = (type: string) =>
    onChange(
      value.includes(type) ? value.filter((t) => t !== type) : [...value, type],
    );

  return (
    <fieldset className="grid gap-3">
      <legend className="sr-only">Events to send</legend>
      <div className="flex flex-wrap gap-4 text-sm text-ink">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name={scope}
            checked={all}
            onChange={() => onChange(["*"])}
            className="size-4 accent-brand-600"
          />
          All events
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name={scope}
            checked={!all}
            onChange={() => onChange([])}
            className="size-4 accent-brand-600"
          />
          Choose events
        </label>
      </div>
      {!all && (
        <div className="grid gap-2 rounded-xl border border-line p-3 sm:grid-cols-2">
          {eventTypes.map((type) => (
            <label
              key={type}
              className="flex items-center gap-2 font-mono text-xs text-ink-soft"
            >
              <input
                type="checkbox"
                checked={value.includes(type)}
                onChange={() => toggle(type)}
                className="size-4 accent-brand-600"
              />
              {type}
            </label>
          ))}
        </div>
      )}
    </fieldset>
  );
}

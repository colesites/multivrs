import { CheckCircle2 } from "lucide-react";
import { type FormEvent, type ReactNode, useState } from "react";
import { Label } from "@/components/ui/label";
import { useAction } from "../context";
import type { AccountSetup } from "../types";
import { Button, Card, ErrorNote } from "../ui";

/** A labelled input, select or textarea for the setup forms. */
export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <Label className="grid content-start gap-1.5 text-ink">
      {label}
      {children}
      {hint && <span className="text-xs font-normal text-mute">{hint}</span>}
    </Label>
  );
}

/** One section of the setup page: a title, what it's for, and whether it's done. */
export function SectionCard({
  title,
  description,
  done,
  children,
}: {
  title: string;
  description: string;
  done: boolean;
  children: ReactNode;
}) {
  return (
    <Card className="grid gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink">{title}</p>
          <p className="text-sm text-mute">{description}</p>
        </div>
        {done && (
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-emerald-700">
            <CheckCircle2 className="size-4" /> Done
          </span>
        )}
      </div>
      {children}
    </Card>
  );
}

/**
 * A setup section that saves with one button. `toBody` turns the form's
 * fields into the API body; saving merges it into the account's details.
 */
export function SectionForm({
  title,
  description,
  done,
  toBody,
  onSaved,
  children,
}: {
  title: string;
  description: string;
  done: boolean;
  toBody: (fields: FormData) => object;
  onSaved: (setup: AccountSetup) => void;
  children: ReactNode;
}) {
  const { run, pending } = useAction();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(false);
    const result = await run<AccountSetup>("/setup", {
      body: toBody(new FormData(event.currentTarget)),
    });
    if (result.error) return setError(result.error);
    setError(null);
    setSaved(true);
    if (result.data) onSaved(result.data);
  }

  return (
    <SectionCard title={title} description={description} done={done}>
      <form onSubmit={save} className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">{children}</div>
        {error && <ErrorNote message={error} />}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={pending}>
            Save
          </Button>
          {saved && <span className="text-sm text-emerald-700">Saved</span>}
        </div>
      </form>
    </SectionCard>
  );
}

/** FormData value as a trimmed string, or undefined when blank (so it isn't sent). */
export function value(fields: FormData, name: string): string | undefined {
  const text = String(fields.get(name) ?? "").trim();
  return text === "" ? undefined : text;
}

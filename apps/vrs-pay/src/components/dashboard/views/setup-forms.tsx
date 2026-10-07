import { useState } from "react";
import { useAction } from "../context";
import type { AccountSetup } from "../types";
import { Button, ErrorNote } from "../ui";

/** Saves part of the setup and hands back the updated status. */
export function useSetupSave(onSaved: (setup: AccountSetup) => void) {
  const { run, pending } = useAction();
  const [error, setError] = useState<string | null>(null);
  async function save(path: string, body: object) {
    const result = await run<AccountSetup>(path, { body });
    if (result.error) return setError(result.error);
    setError(null);
    if (result.data) onSaved(result.data);
  }
  return { save, pending, error };
}

export function FormFooter({
  pending,
  error,
  label = "Save",
}: {
  pending: boolean;
  error: string | null;
  label?: string;
}) {
  return (
    <>
      {error && <ErrorNote message={error} />}
      <Button type="submit" disabled={pending} className="w-fit">
        {label}
      </Button>
    </>
  );
}

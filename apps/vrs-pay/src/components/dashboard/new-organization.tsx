import { type FormEvent, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAction, useDashboard } from "./context";
import type { Organization } from "./types";
import { Button, ErrorNote, Input } from "./ui";
import { Field } from "./views/section-form";

/** A new business with its own setup, products, keys and payouts; you land in it. */
export function NewOrganizationDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { switchTo } = useDashboard();
  const { run, pending } = useAction();
  const [error, setError] = useState<string | null>(null);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = String(
      new FormData(event.currentTarget).get("name") ?? "",
    ).trim();
    const result = await run<Organization>("/organizations", {
      body: { name },
    });
    if (result.error || !result.data)
      return setError(result.error ?? "Couldn't create it.");
    onOpenChange(false);
    switchTo({ merchant: result.data.id, mode: "test" });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)]">
        <form onSubmit={create} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>New organization</DialogTitle>
            <DialogDescription>
              Another business with its own setup, products, API keys and
              payouts. It starts in test mode.
            </DialogDescription>
          </DialogHeader>
          <Field label="Business name">
            <Input
              name="name"
              required
              maxLength={100}
              placeholder="e.g. Ada Studio"
            />
          </Field>
          {error && <ErrorNote message={error} />}
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

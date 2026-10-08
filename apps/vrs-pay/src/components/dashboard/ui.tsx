import type { ComponentProps, ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card as UiCard } from "@/components/ui/card";
import {
  EmptyDescription,
  EmptyTitle,
  Empty as UiEmpty,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import {
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  Table as UiTable,
} from "@/components/ui/table";

/** The dashboard's building blocks, all swift-rust ui underneath. */
export { Button } from "@/components/ui/button";
export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
export { Input } from "@/components/ui/input";
export { NativeSelect } from "@/components/ui/native-select";
export { TableCell, TableRow } from "@/components/ui/table";
export { Textarea } from "@/components/ui/textarea";

export function PageHeader({
  title,
  serif,
  description,
  action,
}: {
  title: string;
  serif?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[1.9rem] leading-tight font-light tracking-[-0.035em] text-ink">
          {serif && <span className="font-display text-[1.1em]">{serif} </span>}
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-xl text-sm text-mute">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function Card({
  children,
  className = "",
  ...props
}: ComponentProps<typeof UiCard>) {
  return (
    // swift-rust's Card is a flex column; ours default to block and set their own layout.
    <UiCard
      className={`block flex-row rounded-2xl p-5 shadow-none ${className}`}
      {...props}
    >
      {children}
    </UiCard>
  );
}

export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <p className="text-xs font-medium text-mute">{label}</p>
      <p className="mt-2 font-mono text-[1.45rem] tracking-tight text-ink">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-mute">{hint}</p>}
    </Card>
  );
}

export function Loading() {
  return (
    <div className="grid place-items-center py-16 text-mute">
      <Spinner aria-label="Loading" />
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <Alert variant="destructive">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

export function Empty({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <UiEmpty className="rounded-2xl py-12">
      <EmptyTitle className="text-sm font-medium text-ink">{title}</EmptyTitle>
      {children && <EmptyDescription>{children}</EmptyDescription>}
    </UiEmpty>
  );
}

/** A bordered table that scrolls sideways on phones instead of breaking the page. */
export function Table({
  head,
  children,
}: {
  head: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <UiTable className="min-w-[640px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {head.map((h, i) => (
              <TableHead
                key={h || `blank-${i}`}
                className="px-4 normal-case tracking-normal"
              >
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>{children}</TableBody>
      </UiTable>
    </div>
  );
}

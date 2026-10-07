import { Badge as UiBadge } from "@/components/ui/badge";

type Variant = "success" | "warning" | "secondary" | "outline";

const VARIANTS: Record<string, Variant> = {
  succeeded: "success",
  paid: "success",
  active: "success",
  enabled: "success",
  pending: "warning",
  past_due: "warning",
  partially_refunded: "warning",
  setting_up: "warning",
  trialing: "outline",
  open: "outline",
};

/** Extra tones on top of swift-rust's variants. */
const TONES: Record<string, string> = {
  trialing: "border-brand-200 bg-brand-50 text-brand-700",
  open: "border-brand-200 bg-brand-50 text-brand-700",
  on_hold: "border-transparent bg-red-500/15 text-red-700",
};

/** A status as a swift-rust badge: green for good, amber for waiting, red for blocked. */
export function Badge({ status }: { status: string }) {
  return (
    <UiBadge
      variant={VARIANTS[status] ?? "secondary"}
      size="sm"
      className={TONES[status]}
    >
      {status.replaceAll("_", " ")}
    </UiBadge>
  );
}

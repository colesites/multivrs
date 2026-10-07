"use client";

import type { CustomerSubscription } from "@vrs-pay/js";
import { type ReactNode, useState } from "react";
import { useVrsPay } from "./context";
import { CustomerPortalView } from "./customer-portal-view";
import { useCustomer } from "./hooks";

export interface CustomerPortalProps {
  /** Asked before canceling; return false to stop. A browser confirm by default. */
  confirmCancel?: (subscription: CustomerSubscription) => boolean | Promise<boolean>;
  loading?: ReactNode;
  locale?: string;
  className?: string;
}

const askBrowser = () =>
  typeof window === "undefined" || window.confirm("Cancel at the end of this period?");

/** The signed-in customer's plan and invoices; they can cancel or keep their plan. */
export function CustomerPortal(props: CustomerPortalProps) {
  const vrs = useVrsPay();
  const { data, error, reload } = useCustomer();
  const [busy, setBusy] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  async function change(sub: CustomerSubscription, work: () => Promise<unknown>) {
    setBusy(sub.id);
    setFailure(null);
    try {
      await work();
      reload();
    } catch (e) {
      setFailure(e instanceof Error ? e.message : "That didn't work.");
    } finally {
      setBusy(null);
    }
  }

  async function cancel(sub: CustomerSubscription) {
    if (!(await (props.confirmCancel ?? askBrowser)(sub))) return;
    await change(sub, () => vrs.cancelSubscription(sub.id));
  }

  if (!data) {
    return error ? <p className="vrs-error">{error.message}</p> : (props.loading ?? null);
  }
  return (
    <CustomerPortalView
      overview={data}
      busy={busy}
      error={failure}
      locale={props.locale}
      className={props.className}
      onCancel={(sub) => void cancel(sub)}
      onResume={(sub) => void change(sub, () => vrs.resumeSubscription(sub.id))}
    />
  );
}

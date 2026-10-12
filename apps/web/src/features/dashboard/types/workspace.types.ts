import type { PlanKey } from "@/lib/payments/billing.types";

/** An account dashboard the viewer can open: their own, or a team they're on. */
export interface DashboardWorkspace {
  username: string;
  name: string;
  image: string | null;
  /** The viewer's role on someone else's team; absent for their own account. */
  role?: string;
}

/** The dashboard being viewed, shown in the sidebar header. */
export interface CurrentWorkspace extends DashboardWorkspace {
  plan?: PlanKey;
}

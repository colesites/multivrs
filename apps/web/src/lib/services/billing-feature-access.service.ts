import "server-only";
import type { AnalyticsRange } from "@/features/dashboard/types/analytics.types";
import type { AddOnKey } from "@/lib/payments/billing.types";
import { hasAddOn } from "@/lib/payments/billing-calculation";
import { resolveBillingEntitlements } from "@/lib/services/billing-entitlement.service";

export type ProjectBillingFeatures = {
  observabilityPlus: boolean;
  speedInsights: boolean;
  webAnalyticsPlus: boolean;
};

export async function getProjectBillingFeatures(
  userId: string,
  projectId: string,
): Promise<ProjectBillingFeatures> {
  const entitlements = await resolveBillingEntitlements(userId, projectId);
  return {
    observabilityPlus: enabled("observability_plus"),
    speedInsights:
      entitlements.context.plan === "hobby" || enabled("speed_insights"),
    webAnalyticsPlus: enabled("web_analytics_plus"),
  };

  function enabled(addOn: AddOnKey): boolean {
    const item = entitlements.items.find(
      (candidate) => candidate.key === addOn,
    );
    return hasAddOn(entitlements.context, addOn, projectId, item?.projectIds);
  }
}

export function entitledAnalyticsRange(
  requested: AnalyticsRange,
  plusEnabled: boolean,
): AnalyticsRange {
  return requested === "30d" && !plusEnabled ? "7d" : requested;
}

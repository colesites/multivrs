import { Settings } from "lucide-react";
import { AccountActivity } from "@/features/dashboard/components/AccountActivity";
import { AccountProfileForm } from "@/features/dashboard/components/AccountProfileForm";
import { AccountSecurity } from "@/features/dashboard/components/AccountSecurity";
import { ApiTokensPage } from "@/features/dashboard/components/ApiTokensPage";
import { BillingManager } from "@/features/dashboard/components/BillingManager";
import { OrganizationManager } from "@/features/dashboard/components/OrganizationManager";
import type { BillingOverview } from "@/features/dashboard/types/billing.types";
import type { AccountProfile } from "@/lib/schemas/account.schemas";
import type { ApiTokenSummary } from "@/lib/services/api-token.service";
import type { DashboardAuditEvent } from "@/lib/services/audit-event.service";

interface SettingsPageProps {
  profile: AccountProfile;
  tokens: ApiTokenSummary[];
  events: DashboardAuditEvent[];
  twoFactorEnabled: boolean;
  billing: BillingOverview;
}

export function SettingsPage({
  billing,
  events,
  profile,
  tokens,
  twoFactorEnabled,
}: SettingsPageProps) {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-7 px-5 py-8">
      <header className="flex items-start justify-between gap-6">
        <div>
          <p className="font-geist-mono text-[10px] uppercase tracking-[0.16em] text-blue-400">
            Account
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            Settings
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your identity and programmatic access.
          </p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/6">
          <Settings className="size-5 text-blue-300" />
        </div>
      </header>
      <div className="space-y-7">
        <AccountProfileForm initialProfile={profile} />
        <AccountSecurity initiallyEnabled={twoFactorEnabled} />
        <OrganizationManager />
        <BillingManager initial={billing} />
        <ApiTokensPage initialTokens={tokens} embedded />
        <AccountActivity events={events} />
      </div>
    </div>
  );
}

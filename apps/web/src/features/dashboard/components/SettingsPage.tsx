import { AccountActivity } from "@/features/dashboard/components/AccountActivity";
import { AccountProfileForm } from "@/features/dashboard/components/AccountProfileForm";
import { AccountSecurity } from "@/features/dashboard/components/AccountSecurity";
import { ApiTokensPage } from "@/features/dashboard/components/ApiTokensPage";
import { OrganizationManager } from "@/features/dashboard/components/OrganizationManager";
import type { AccountProfile } from "@/lib/schemas/account.schemas";
import type { ApiTokenSummary } from "@/lib/services/api-token.service";
import type { DashboardAuditEvent } from "@/lib/services/audit-event.service";

interface SettingsPageProps {
  profile: AccountProfile;
  tokens: ApiTokenSummary[];
  events: DashboardAuditEvent[];
  twoFactorEnabled: boolean;
}

export function SettingsPage({
  events,
  profile,
  tokens,
  twoFactorEnabled,
}: SettingsPageProps) {
  return (
    <div className="mx-auto max-w-[1000px] px-5 py-8">
      <header>
        <p className="font-geist-mono text-[10px] uppercase tracking-[0.16em] text-blue-400">
          Account
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your identity and programmatic access.
        </p>
      </header>
      <div className="mt-8">
        <AccountProfileForm initialProfile={profile} />
        <AccountSecurity initiallyEnabled={twoFactorEnabled} />
        <OrganizationManager />
        <ApiTokensPage initialTokens={tokens} embedded />
        <AccountActivity events={events} />
      </div>
    </div>
  );
}

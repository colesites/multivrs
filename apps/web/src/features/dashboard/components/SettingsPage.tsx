import { AccountActivity } from "@/features/dashboard/components/AccountActivity";
import { AccountDeletion } from "@/features/dashboard/components/AccountDeletion";
import { AccountPasskeys } from "@/features/dashboard/components/AccountPasskeys";
import { AccountProfileForm } from "@/features/dashboard/components/AccountProfileForm";
import { AccountSecurity } from "@/features/dashboard/components/AccountSecurity";
import { AccountSessions } from "@/features/dashboard/components/AccountSessions";
import { AccountSignInMethods } from "@/features/dashboard/components/AccountSignInMethods";
import { ApiTokensPage } from "@/features/dashboard/components/ApiTokensPage";
import { BillingManager } from "@/features/dashboard/components/BillingManager";
import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import {
  SettingsNav,
  type SettingsSection,
} from "@/features/dashboard/components/SettingsNav";
import { TeamManager } from "@/features/dashboard/components/TeamManager";
import type {
  AccountDeletionBlocker,
  AccountSignIn,
} from "@/features/dashboard/types/account-security.types";
import type { BillingOverview } from "@/features/dashboard/types/billing.types";
import type { AccountProfile } from "@/lib/schemas/account.schemas";
import type { ApiTokenSummary } from "@/lib/services/api-token.service";
import type { DashboardAuditEvent } from "@/lib/services/audit-event.service";

const SECTIONS: SettingsSection[] = [
  { id: "general", label: "General" },
  { id: "authentication", label: "Authentication" },
  { id: "sessions", label: "Sessions" },
  { id: "tokens", label: "Tokens" },
  { id: "activity", label: "Activity" },
  { id: "delete-account", label: "Delete account" },
];

interface SettingsPageProps {
  billing?: BillingOverview;
  deletionBlockers: AccountDeletionBlocker[];
  events: DashboardAuditEvent[];
  profile: AccountProfile;
  signIn: AccountSignIn;
  tokens: ApiTokenSummary[];
  twoFactorEnabled: boolean;
}

export function SettingsPage({
  billing,
  deletionBlockers,
  events,
  profile,
  signIn,
  tokens,
  twoFactorEnabled,
}: SettingsPageProps) {
  return (
    <div className="w-full px-5 py-6">
      <DashboardPageHeader
        title="Account Settings"
        description="Your personal profile, sign-in methods, sessions, and security."
      />
      <div className="mt-6 lg:grid lg:grid-cols-[11rem_minmax(0,1fr)] lg:gap-10">
        <SettingsNav sections={SECTIONS} />
        <div className="min-w-0 max-w-4xl space-y-10">
          <Section id="general">
            <AccountProfileForm initialProfile={profile} />
          </Section>
          <Section id="authentication">
            <AccountSignInMethods signIn={signIn} />
            <AccountPasskeys passkeys={signIn.passkeys} />
            <AccountSecurity initiallyEnabled={twoFactorEnabled} />
          </Section>
          <Section id="sessions">
            <AccountSessions sessions={signIn.sessions} />
          </Section>
          <Section id="tokens">
            <ApiTokensPage initialTokens={tokens} embedded />
          </Section>
          <Section id="activity">
            <AccountActivity events={events} />
          </Section>
          <Section id="delete-account">
            <AccountDeletion
              username={profile.username}
              email={profile.email}
              blockers={deletionBlockers}
            />
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ id, children }: { id: string; children: React.ReactNode }) {
  // scroll-mt clears the fixed topbar when jumping to a section.
  return (
    <div id={id} className="scroll-mt-20 space-y-5">
      {children}
    </div>
  );
}

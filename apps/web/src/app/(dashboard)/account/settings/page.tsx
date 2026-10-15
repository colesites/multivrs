import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { AccountChrome } from "@/features/dashboard/components/AccountChrome";
import { SettingsPage } from "@/features/dashboard/components/SettingsPage";
import { getServerSession } from "@/lib/auth/session";
import { accountDeletionBlockers } from "@/lib/services/account-deletion.service";
import { getAccountProfile } from "@/lib/services/account-profile.service";
import { getAccountSignIn } from "@/lib/services/account-sign-in.service";
import { listApiTokens } from "@/lib/services/api-token.service";
import { listAuditEvents } from "@/lib/services/audit-event.service";

export default async function AccountSettingsRoute() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const [events, profile, tokens, signIn, deletionBlockers] =
    await Promise.all([
      listAuditEvents(session.user.id),
      getAccountProfile(session.user.id),
      listApiTokens(session.user.id),
      getAccountSignIn(await headers(), {
        userId: session.user.id,
        sessionId: session.session.id,
      }),
      accountDeletionBlockers(session.user.id),
    ]);

  return (
    <div className="dashboard-surface min-h-screen bg-(--ink) text-foreground">
      <AccountChrome
        user={{
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        }}
        workspaceName={profile.username || "account"}
      />
      <div className="lg:pl-67 min-w-0 max-w-full">
        <div className="h-14" aria-hidden="true" />
        <main className="min-h-[calc(100vh-3.5rem)] min-w-0 max-w-full">
          <SettingsPage
            deletionBlockers={deletionBlockers}
            events={events}
            profile={profile}
            signIn={signIn}
            tokens={tokens}
            twoFactorEnabled={session.user.twoFactorEnabled ?? false}
          />
        </main>
      </div>
    </div>
  );
}

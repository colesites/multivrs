import { AtSign } from "lucide-react";
import { EmailRouteForm } from "@/features/dashboard/components/EmailRouteForm";
import { EmailRouteRows } from "@/features/dashboard/components/EmailRouteRows";
import type {
  DashboardEmailRoute,
  EmailDomainOption,
} from "@/features/dashboard/types/email-route.types";

export function EmailRoutesPage({
  domains,
  projectId,
  projectName,
  routes,
}: {
  domains: EmailDomainOption[];
  projectId?: string;
  projectName: string;
  routes: DashboardEmailRoute[];
}) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-7 px-5 py-8">
      <header className="flex items-start justify-between gap-6">
        <div>
          <p className="font-geist-mono text-[10px] uppercase tracking-[0.16em] text-blue-400">
            Email forwarding
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Email Domains
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Forward addresses on managed domains for {projectName}.
          </p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/[0.06]">
          <AtSign className="size-5 text-blue-300" />
        </div>
      </header>
      <section className="overflow-hidden rounded-2xl border border-[var(--hairline)] bg-background/70">
        <div className="border-b border-[var(--hairline)] px-5 py-4">
          <h2 className="text-sm font-semibold">Routing rules</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Cloudflare accepts mail and forwards it without storing a mailbox.
          </p>
        </div>
        {domains.length ? (
          <EmailRouteForm domains={domains} projectId={projectId} />
        ) : (
          <p className="border-b border-[var(--hairline)] px-5 py-5 text-xs text-amber-200">
            Buy or connect a managed domain before creating an email route.
          </p>
        )}
        <EmailRouteRows routes={routes} />
      </section>
    </div>
  );
}

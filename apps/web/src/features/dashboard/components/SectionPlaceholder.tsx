import { DashboardPageHeader } from "./DashboardPageHeader";

interface SectionPlaceholderProps {
  title: string;
  description?: string;
  scopeLabel: string;
}

/**
 * Premium scaffold for sections whose data UI is still to come. Flat surface,
 * hairline panel, no gradients — keeps the route real while the feature lands.
 */
export function SectionPlaceholder({
  title,
  description,
  scopeLabel,
}: SectionPlaceholderProps) {
  return (
    <>
      <DashboardPageHeader title={title} description={description} />
      <div className="px-8 py-8">
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--hairline-strong)] bg-white/[0.012] px-6 text-center">
          <span className="font-geist-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground/60">
            Coming soon
          </span>
          <p className="mt-3 max-w-sm text-[14px] text-muted-foreground">
            {title} for {scopeLabel.toLowerCase()} is being wired up. The route
            is live — content lands next.
          </p>
        </div>
      </div>
    </>
  );
}

import type { ReactNode } from "react";

interface DashboardPageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  /** Buttons or links beside the title. */
  actions?: ReactNode;
  /** Shown under the title, such as range tabs or status. */
  children?: ReactNode;
}

/**
 * The title block every dashboard page opens with. Pages sit in
 * `w-full space-y-6 px-5 py-6` so it lines up with the topbar breadcrumb.
 */
export function DashboardPageHeader({
  title,
  description,
  actions,
  children,
}: DashboardPageHeaderProps) {
  return (
    <header>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
      {children}
    </header>
  );
}

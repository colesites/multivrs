import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SettingsCardProps {
  children: ReactNode;
  className?: string;
  danger?: boolean;
}

export function SettingsCard({ children, className, danger }: SettingsCardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-background/50 backdrop-blur-xs transition-colors",
        danger
          ? "border-destructive/30 hover:border-destructive/50"
          : "border-(--hairline) hover:border-(--hairline-strong)",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface SettingsCardBodyProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  badge?: ReactNode;
}

export function SettingsCardBody({
  title,
  description,
  children,
  className,
  badge,
}: SettingsCardBodyProps) {
  return (
    <div className={cn("p-5 sm:p-6", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[14.5px] font-medium tracking-[-0.01em] text-foreground">
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {badge}
      </div>
      <div className="mt-4 sm:mt-5">{children}</div>
    </div>
  );
}

interface SettingsCardFooterProps {
  helperText?: ReactNode;
  action?: ReactNode;
  className?: string;
  danger?: boolean;
}

export function SettingsCardFooter({
  helperText,
  action,
  className,
  danger,
}: SettingsCardFooterProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t px-5 sm:px-6 py-3 text-xs",
        danger
          ? "border-destructive/20 bg-destructive/5 text-destructive/90"
          : "border-(--hairline) bg-white/[0.02] dark:bg-white/[0.01] text-muted-foreground",
        className,
      )}
    >
      <div className="min-w-0 text-xs text-muted-foreground">{helperText}</div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

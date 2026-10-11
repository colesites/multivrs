import type * as React from "react";
import { cn } from "@/lib/utils";

export function Empty({
  title,
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { title?: string }) {
  if (title) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-12 text-center",
          className,
        )}
        {...props}
      >
        <EmptyTitle className="text-sm font-medium text-ink">{title}</EmptyTitle>
        {children && <EmptyDescription>{children}</EmptyDescription>}
      </div>
    );
  }
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border p-10 text-center",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function EmptyMedia({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground [&_svg]:size-6",
        className,
      )}
      {...props}
    />
  );
}

export function EmptyTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-base font-semibold", className)} {...props} />;
}

export function EmptyDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("max-w-sm text-sm text-muted-foreground", className)} {...props} />;
}
